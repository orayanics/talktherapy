import { status } from "elysia";
import { prisma } from "prisma/db";
import type { SoapModel } from "./model";
import { toUtcStartOfDay, toUtcEndOfDay } from "@/utils/date";

// Strip internal FKs from SOAP responses
const SOAP_SELECT = {
  id: true,
  activity_plan: true,
  session_type: true,
  subjective_notes: true,
  objective_notes: true,
  assessment: true,
  recommendation: true,
  comments: true,
  created_at: true,
  updated_at: true,
} as const;

export abstract class SoapService {
  private static async resolvePatientId(user_id: string): Promise<string> {
    const patient = await prisma.patient.findUnique({
      where: { user_id },
      select: { id: true },
    });
    if (!patient) throw status(404, "Patient profile not found");
    return patient.id;
  }

  /**
   * Asserts the patient is in the clinician's handled list.
   * Prevents creating SOAP notes for patients with no completed appointment.
   */
  private static async assertHandled(clinician_id: string, patient_id: string) {
    const link = await prisma.clinicianPatient.findUnique({
      where: { clinician_id_patient_id: { clinician_id, patient_id } },
    });
    if (!link) {
      throw status(
        403,
        "Patient has no completed appointment with this clinician",
      );
    }
  }

  /**
   * Asserts the SOAP note belongs to this clinician and returns it.
   */
  private static async assertOwner(clinician_id: string, soap_id: string) {
    const soap = await prisma.soap.findUnique({ where: { id: soap_id } });
    if (!soap || soap.clinician_id !== clinician_id) {
      throw status(404, "SOAP note not found");
    }
    return soap;
  }

  // Clinician operations

  /**
   * Creates a SOAP note for a handled patient.
   */
  static async createSoap(
    clinician_id: string,
    patient_id: string,
    data: SoapModel.createBody,
  ) {
    await SoapService.assertHandled(clinician_id, patient_id);

    return prisma.soap.create({
      data: {
        clinician_id,
        patient_id,
        activity_plan: data.activity_plan,
        session_type: data.session_type,
        subjective_notes: data.subjective_notes,
        objective_notes: data.objective_notes,
        assessment: data.assessment,
        recommendation: data.recommendation,
        comments: data.comments ?? null,
      },
      select: SOAP_SELECT,
    });
  }

  /**
   * Returns paginated SOAP notes a clinician has written for a specific patient.
   */
  static async listSoapsByPatient(
    clinician_id: string,
    patient_id: string,
    query: SoapModel.clinicianListQuery,
  ) {
    await SoapService.assertHandled(clinician_id, patient_id);

    const { from, to, page = 1, per_page = 10 } = query;
    const skip = (page - 1) * per_page;

    const createdAtFilter: { gte?: Date; lte?: Date } = {};
    if (from) createdAtFilter.gte = toUtcStartOfDay(from);
    if (to) createdAtFilter.lte = toUtcEndOfDay(to);

    const where = {
      clinician_id,
      patient_id,
      ...(Object.keys(createdAtFilter).length > 0 && {
        created_at: createdAtFilter,
      }),
    };

    const [soaps, total] = await prisma.$transaction([
      prisma.soap.findMany({
        where,
        select: SOAP_SELECT,
        orderBy: { created_at: "desc" },
        skip,
        take: per_page,
      }),
      prisma.soap.count({ where }),
    ]);

    return {
      data: soaps,
      meta: {
        total,
        page,
        per_page,
        last_page: Math.ceil(total / per_page),
        from: skip + 1,
        to: skip + soaps.length,
      },
    };
  }

  /**
   * Returns a single SOAP note — clinician must own it.
   */
  static async getSoap(clinician_id: string, soap_id: string) {
    const soap = await SoapService.assertOwner(clinician_id, soap_id);
    // Strip internal FKs before returning to the client
    const { clinician_id: _cid, patient_id: _pid, ...rest } = soap;
    return rest;
  }

  /**
   * Partially updates a SOAP note — clinician must own it.
   */
  static async updateSoap(
    clinician_id: string,
    soap_id: string,
    data: SoapModel.updateBody,
  ) {
    await SoapService.assertOwner(clinician_id, soap_id);

    const update: Record<string, unknown> = {};
    if (data.activity_plan !== undefined)
      update.activity_plan = data.activity_plan;
    if (data.session_type !== undefined)
      update.session_type = data.session_type;
    if (data.subjective_notes !== undefined)
      update.subjective_notes = data.subjective_notes;
    if (data.objective_notes !== undefined)
      update.objective_notes = data.objective_notes;
    if (data.assessment !== undefined) update.assessment = data.assessment;
    if (data.recommendation !== undefined)
      update.recommendation = data.recommendation;
    if (data.comments !== undefined) update.comments = data.comments;

    const updated = await prisma.soap.update({
      where: { id: soap_id },
      data: update,
      select: SOAP_SELECT,
    });
    return updated;
  }

  // Patient operations

  /**
   * Returns all SOAP notes for a patient, each including the authoring
   * clinician's name (from the linked User record).
   */
  static async listPatientSoaps(
    user_id: string,
    query: SoapModel.patientListQuery,
  ) {
    const patient_id = await SoapService.resolvePatientId(user_id);
    const { from, to, clinician_name, page = 1, per_page = 10 } = query;
    const skip = (page - 1) * per_page;

    const createdAtFilter: { gte?: Date; lte?: Date } = {};
    if (from) createdAtFilter.gte = toUtcStartOfDay(from);
    if (to) createdAtFilter.lte = toUtcEndOfDay(to);

    const where = {
      patient_id,
      ...(Object.keys(createdAtFilter).length > 0 && {
        created_at: createdAtFilter,
      }),
      ...(clinician_name && {
        clinician: { user: { name: { contains: clinician_name } } },
      }),
    };

    const [soaps, total] = await prisma.$transaction([
      prisma.soap.findMany({
        where,
        include: {
          clinician: {
            select: {
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: per_page,
      }),
      prisma.soap.count({ where }),
    ]);

    return {
      data: soaps.map(
        ({ clinician, clinician_id: _cid, patient_id: _pid, ...rest }) => ({
          ...rest,
          clinician_name: clinician.user.name ?? null,
        }),
      ),
      meta: {
        total,
        page,
        per_page,
        last_page: Math.ceil(total / per_page),
        from: skip + 1,
        to: skip + soaps.length,
      },
    };
  }

  /**
   * Returns a single SOAP note for the patient.
   */
  static async getPatientSoap(user_id: string, soap_id: string) {
    const patient_id = await SoapService.resolvePatientId(user_id);

    const soap = await prisma.soap.findFirst({
      where: { id: soap_id, patient_id },
      include: {
        clinician: {
          select: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!soap) throw status(404, "SOAP note not found");

    const { clinician, clinician_id: _cid, patient_id: _pid, ...rest } = soap;
    return { ...rest, clinician_name: clinician.user.name ?? null };
  }
}

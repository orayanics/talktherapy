import { status } from "elysia";
import { prisma } from "prisma/db";
import type { SoapModel } from "./model";

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
    });
  }

  /**
   * Returns all SOAP notes a clinician has written for a specific patient.
   */
  static async listSoapsByPatient(clinician_id: string, patient_id: string) {
    await SoapService.assertHandled(clinician_id, patient_id);

    return prisma.soap.findMany({
      where: { clinician_id, patient_id },
      orderBy: { created_at: "desc" },
    });
  }

  /**
   * Returns a single SOAP note — clinician must own it.
   */
  static async getSoap(clinician_id: string, soap_id: string) {
    return SoapService.assertOwner(clinician_id, soap_id);
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

    return prisma.soap.update({ where: { id: soap_id }, data: update });
  }

  // Patient operations

  /**
   * Returns all SOAP notes for a patient, each including the authoring
   * clinician's name (from the linked User record).
   */
  static async listPatientSoaps(user_id: string) {
    const patient_id = await SoapService.resolvePatientId(user_id);

    const soaps = await prisma.soap.findMany({
      where: { patient_id },
      include: {
        clinician: {
          select: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return soaps.map(({ clinician, ...rest }) => ({
      ...rest,
      clinician_name: clinician.user.name ?? null,
    }));
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

    const { clinician, ...rest } = soap;
    return { ...rest, clinician_name: clinician.user.name ?? null };
  }
}

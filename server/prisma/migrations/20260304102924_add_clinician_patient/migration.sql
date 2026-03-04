-- CreateTable
CREATE TABLE "ClinicianPatient" (
    "clinician_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "first_completed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("clinician_id", "patient_id"),
    CONSTRAINT "ClinicianPatient_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "Clinician" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClinicianPatient_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

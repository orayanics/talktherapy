-- CreateTable
CREATE TABLE "Soap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinician_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "activity_plan" TEXT NOT NULL,
    "session_type" TEXT NOT NULL,
    "subjective_notes" TEXT NOT NULL,
    "objective_notes" TEXT NOT NULL,
    "assessment" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "comments" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Soap_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "Clinician" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Soap_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

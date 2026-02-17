-- CreateTable
CREATE TABLE "Permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Otps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "otp_code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ScheduleRules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinician_id" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "recurrence" TEXT,
    "recurrence_meta" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScheduleInstances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schedule_rule_id" TEXT NOT NULL,
    "clinician_id" TEXT NOT NULL,
    "starts_at" DATETIME NOT NULL,
    "ends_at" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Appointments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinician_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "schedule_instance_id" TEXT NOT NULL,
    "room_id" TEXT,
    "status" TEXT NOT NULL,
    "starts_at" DATETIME NOT NULL,
    "ends_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "medical_diagnosis" TEXT,
    "source_referral" TEXT,
    "chief_complaint" TEXT,
    "refarral_url" TEXT,
    "booked_at" DATETIME,
    "confirmed_at" DATETIME,
    "cancelled_at" DATETIME,
    "completed_at" DATETIME,
    "rescheduled_at" DATETIME,
    "cancelled_by" TEXT,
    "patient_cancel_reason" TEXT,
    "clinician_cancel_reason" TEXT,
    "patient_reshedule_reason" TEXT,
    "clinician_reschedule_reason" TEXT
);

-- CreateTable
CREATE TABLE "RescheduleRequests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointment_id" TEXT NOT NULL,
    "clinician_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "original_schedule_instance_id" TEXT NOT NULL,
    "requested_schedule_instance_id" TEXT NOT NULL,
    "patient_reason" TEXT,
    "clinician_reason" TEXT,
    "status" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_name_key" ON "Permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Diagnosis_value_key" ON "Diagnosis"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Diagnosis_label_key" ON "Diagnosis"("label");

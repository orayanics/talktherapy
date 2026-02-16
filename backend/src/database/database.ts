import { Database } from "bun:sqlite";
export const db = new Database("db.sqlite", { create: true });

db.run(`PRAGMA foreign_keys = ON;`);

// init: create tables if not exist
export function initDb() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified_at DATETIME,
      password TEXT,
      remember_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      account_status TEXT DEFAULT 'active',
      account_role TEXT,
      account_type TEXT,
      account_json TEXT,
      created_by TEXT,
      updated_by TEXT,
      deleted_at DATETIME
    )
  `);
  // Create index on email for faster lookups
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);

  // Sudos table (super admins)
  db.run(`
    CREATE TABLE IF NOT EXISTS sudos (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  // Admins table
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  // Patients table
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      diagnosis_id TEXT,
      consent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE SET NULL
    )
  `);

  // Clinicians table
  db.run(`
    CREATE TABLE IF NOT EXISTS clinicians (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      diagnosis_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE SET NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      otp_code TEXT,
      purpose TEXT,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  // Diagnoses table
  db.run(`
    CREATE TABLE IF NOT EXISTS diagnoses (
      id TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      label TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Schedule rules table
  db.run(`
    CREATE TABLE IF NOT EXISTS schedule_rules (
      id TEXT PRIMARY KEY,
      clinician_id TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      recurrence TEXT,
      recurrence_meta TEXT,
      timezone TEXT DEFAULT 'UTC',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (clinician_id) REFERENCES clinicians(id) ON DELETE CASCADE
    )
  `);

  // Schedule instances table
  db.run(`
    CREATE TABLE IF NOT EXISTS schedule_instances (
      id TEXT PRIMARY KEY,
      schedule_rule_id TEXT NOT NULL,
      clinician_id TEXT NOT NULL,
      starts_at DATETIME NOT NULL,
      ends_at DATETIME NOT NULL,
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (schedule_rule_id) REFERENCES schedule_rules(id) ON DELETE CASCADE,
      FOREIGN KEY (clinician_id) REFERENCES clinicians(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for faster schedule lookups
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_schedule_instances_rule ON schedule_instances(schedule_rule_id)`,
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_schedule_instances_clinician ON schedule_instances(clinician_id)`,
  );

  // Appointments table
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      clinician_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      schedule_instance_id TEXT,
      appointment_room_id TEXT,
      status TEXT DEFAULT 'scheduled',
      starts_at DATETIME NOT NULL,
      ends_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      medical_diagnosis TEXT,
      source_referral TEXT,
      chief_complaint TEXT,
      referral_url TEXT,
      booked_at DATETIME,
      confirmed_at DATETIME,
      cancelled_at DATETIME,
      completed_at DATETIME,
      rescheduled_at DATETIME,
      cancelled_by TEXT,
      patient_cancel_reason TEXT,
      clinician_cancel_reason TEXT,
      patient_reschedule_reason TEXT,
      clinician_reschedule_reason TEXT,
      FOREIGN KEY (clinician_id) REFERENCES clinicians(id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY (schedule_instance_id) REFERENCES schedule_instances(id) ON DELETE SET NULL
    )
  `);

  // Create indexes for appointments
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_appointments_clinician ON appointments(clinician_id)`,
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id)`,
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)`,
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_appointments_starts_at ON appointments(starts_at)`,
  );

  // Reschedule requests table
  db.run(`
    CREATE TABLE IF NOT EXISTS reschedule_requests (
      id TEXT PRIMARY KEY,
      appointment_id TEXT NOT NULL,
      clinician_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      original_schedule_instance_id TEXT,
      requested_schedule_instance_id TEXT,
      patient_reason TEXT,
      clinician_reason TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
      FOREIGN KEY (clinician_id) REFERENCES clinicians(id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY (original_schedule_instance_id) REFERENCES schedule_instances(id) ON DELETE SET NULL,
      FOREIGN KEY (requested_schedule_instance_id) REFERENCES schedule_instances(id) ON DELETE SET NULL
    )
  `);

  // Permissions table
  db.run(`
    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// seed: insert initial data if tables are empty
export function seedDb() {
  // permission seeder
  const existingPermissions = db.query(`SELECT name FROM permissions`).all();
  const existingPermissionNames = new Set(
    existingPermissions.map((p) => p.name),
  );

  const permissionsToInsert = [
    "users:create",
    "users:read",
    "users:update",
    "users:delete",
    "content:create",
    "content:read",
    "content:update",
    "content:delete",
    "system:maintenance",
  ].filter((perm) => !existingPermissionNames.has(perm));

  const insertPermissionStmt = db.prepare(
    `INSERT INTO permissions (id, name) VALUES (?, ?)`,
  );

  for (const perm of permissionsToInsert) {
    insertPermissionStmt.run(crypto.randomUUID(), perm);
  }

  // diagnosis seeder
  const existingDiagnoses = db.query(`SELECT value FROM diagnoses`).all();
  const existingDiagnosisValues = new Set(
    existingDiagnoses.map((d) => d.value),
  );

  const diagnosesToInsert = [
    { value: "ASD", label: "Autism Spectrum Disorder" },
    { value: "ADHD", label: "Attention-Deficit Hyperactivity Disorder" },
    { value: "GDD", label: "Global Developmental Delay" },
    { value: "CP", label: "Cerebral Palsy" },
    { value: "DS", label: "Down Syndrome" },
    { value: "HI", label: "Hearing Impairment" },
    { value: "CLP", label: "Cleft Lip and/or Palate" },
    { value: "STR", label: "Stroke" },
    { value: "STUT", label: "Stuttering" },
    { value: "APH", label: "Aphasia" },
    { value: "OTH", label: "Others" },
  ].filter((diag) => !existingDiagnosisValues.has(diag.value));

  const insertDiagnosisStmt = db.prepare(
    `INSERT INTO diagnoses (id, value, label) VALUES (?, ?, ?)`,
  );

  for (const diag of diagnosesToInsert) {
    insertDiagnosisStmt.run(crypto.randomUUID(), diag.value, diag.label);
  }

  // user seeder
}

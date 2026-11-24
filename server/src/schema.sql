CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(120),
  availability VARCHAR(200) DEFAULT 'Mon-Fri 9am-5pm',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(100) NOT NULL,
  patient_phone VARCHAR(30) NOT NULL,
  patient_email VARCHAR(120),
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  reason VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appt_doctor_time ON appointments(doctor_id, starts_at);
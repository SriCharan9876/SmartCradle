CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  display_name TEXT,
  photo_url TEXT,
  provider TEXT DEFAULT 'local',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cradles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  cradle_name TEXT NOT NULL,
  baby_name TEXT,
  location TEXT,

  device_key TEXT UNIQUE NOT NULL,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cradle_data (
  id BIGSERIAL PRIMARY KEY,

  cradle_id UUID NOT NULL REFERENCES cradles(id) ON DELETE CASCADE,
  boot_id TEXT NOT NULL,
  uptime_seconds BIGINT NOT NULL,

  temperature REAL,
  humidity REAL,
  sound_level REAL,

  motion_state TEXT,
  acc_x REAL,
  acc_y REAL,
  acc_z REAL,

  confidence_idle REAL,
  confidence_normal REAL,
  confidence_shake REAL,
  confidence_tilt REAL,

  anomaly_temperature BOOLEAN,
  anomaly_humidity BOOLEAN,
  anomaly_motion BOOLEAN,
  anomaly_noise BOOLEAN,
  anomaly_overall BOOLEAN,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE (cradle_id, boot_id, uptime_seconds)
);

CREATE TABLE user_otps (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  UNIQUE (email)
);

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cradle_id UUID NOT NULL REFERENCES cradles(id) ON DELETE CASCADE,

  -- classification
  type TEXT NOT NULL,               -- 'ANOMALY' | 'INFO'

  title TEXT NOT NULL,
  message TEXT NOT NULL,

  is_read BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);

import { sql } from "../config/db.js";

export async function getCradles(req, res) {
  const cradles = await sql`
    SELECT c.id, c.cradle_name, c.location, c.baby_name, c.created_at, c.device_key,
           d.anomaly_overall
    FROM cradles c
    LEFT JOIN LATERAL (
      SELECT anomaly_overall
      FROM cradle_data
      WHERE cradle_id = c.id
      ORDER BY created_at DESC
      LIMIT 1
    ) d ON true
    WHERE c.user_id = ${req.user.id}
  `;
  res.json(cradles);
}

export async function getLatestStatus(req, res) {
  const [row] = await sql`
    SELECT c.cradle_name, c.baby_name, c.location, cd.*
    FROM cradles c
    LEFT JOIN LATERAL (
      SELECT *
      FROM cradle_data
      WHERE cradle_id = c.id
      ORDER BY created_at DESC
      LIMIT 1
    ) cd ON true
    WHERE c.id = ${req.params.cradleId}
  `;

  if (!row) {
    return res.status(404).json({ error: "Cradle not found" });
  }
  res.json(row);
}

export async function getHistory(req, res) {
  const limit = Number(req.query.limit || 50);

  const rows = await sql`
    SELECT 
      created_at, 
      temperature, 
      humidity, 
      sound_level,
      motion_state,
      confidence_idle,
      confidence_normal,
      confidence_shake,
      confidence_tilt,
      anomaly_temperature,
      anomaly_humidity,
      anomaly_motion,
      anomaly_noise,
      anomaly_overall,
      uptime_seconds,
      boot_id
    FROM cradle_data
    WHERE cradle_id = ${req.params.cradleId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  res.json(rows);
}

export async function createCradle(req, res) {
  const { cradle_name, baby_name, location, device_key } = req.body;

  if (!cradle_name || !device_key) {
    return res.status(400).json({ error: "cradle_name and device_key are required" });
  }

  const [newCradle] = await sql`
    INSERT INTO cradles (user_id, cradle_name, baby_name, location, device_key)
    VALUES (${req.user.id}, ${cradle_name}, ${baby_name || null}, ${location || null}, ${device_key})
    RETURNING *
  `;

  res.status(201).json(newCradle);
}

export async function updateCradle(req, res) {
  const { cradleId } = req.params;
  const { cradle_name, baby_name, location } = req.body;

  if (!cradle_name) {
    return res.status(400).json({ error: "cradle_name is required" });
  }

  const [updatedCradle] = await sql`
    UPDATE cradles
    SET cradle_name = ${cradle_name},
        baby_name = ${baby_name || null},
        location = ${location || null}
    WHERE id = ${cradleId} AND user_id = ${req.user.id}
    RETURNING *
  `;

  if (!updatedCradle) {
    return res.status(404).json({ error: "Cradle not found or unauthorized" });
  }

  res.json(updatedCradle);
}

export async function deleteCradle(req, res) {
  const { cradleId } = req.params;

  // Note: ON DELETE CASCADE in schema ensures cradle_data and notifications are also deleted
  const [deletedCradle] = await sql`
    DELETE FROM cradles
    WHERE id = ${cradleId} AND user_id = ${req.user.id}
    RETURNING id
  `;

  if (!deletedCradle) {
    return res.status(404).json({ error: "Cradle not found or unauthorized" });
  }


  res.json({ message: "Cradle deleted successfully", id: deletedCradle.id });
}

export async function getStatusByDeviceToken(req, res) {
  console.log("hi device token");
  const token = req.headers['x-device-token'];
  console.log(token);

  if (!token) {
    return res.status(401).json({ error: "Missing device token" });
  }

  const [row] = await sql`
    SELECT c.cradle_name, c.baby_name, c.location, cd.*
    FROM cradles c
    LEFT JOIN LATERAL (
      SELECT *
      FROM cradle_data
      WHERE cradle_id = c.id
      ORDER BY created_at DESC
      LIMIT 1
    ) cd ON true
    WHERE c.device_key = ${token}
  `;

  if (!row) {
    return res.status(404).json({ error: "Invalid token or cradle not found" });
  }

  res.json(row);
}
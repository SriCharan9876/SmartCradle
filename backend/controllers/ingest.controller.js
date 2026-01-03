import { sql } from "../config/db.js";

export async function ingestLog(req, res) {
  const cradleId = req.cradleId;
  const data = req.body;

  try {
    await sql`
      INSERT INTO cradle_data (
        cradle_id, boot_id, uptime_seconds,
        temperature, humidity, sound_level,
        motion_state,
        acc_x, acc_y, acc_z,
        confidence_idle, confidence_normal, confidence_shake, confidence_tilt,
        anomaly_temperature, anomaly_humidity,
        anomaly_motion, anomaly_noise, anomaly_overall
      ) VALUES (
        ${cradleId}, ${data.boot_id}, ${data.uptime_seconds},
        ${data.temperature}, ${data.humidity}, ${data.sound_level},
        ${data.motion_state},
        ${data.acc_x}, ${data.acc_y}, ${data.acc_z},
        ${data.confidence_idle}, ${data.confidence_normal},
        ${data.confidence_shake}, ${data.confidence_tilt},
        ${data.anomaly_temperature}, ${data.anomaly_humidity},
        ${data.anomaly_motion}, ${data.anomaly_noise},
        ${data.anomaly_overall}
      )
    `;

    res.json({ status: "ok" });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Duplicate timestamp" });
    }
    res.status(500).json({ error: err.message });
  }
}

import { sql } from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";

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

    // Check for anomalies and trigger notification if needed
    // We need to check if we just crossed the threshold of > 5 continuous anomalies.
    // This means the current log (just inserted) is anomalous, and the previous 5 were also anomalous,
    // making a total of 6 continuous anomalies.
    // And ideally, the 7th previous record was NOT anomalous (or didn't exist), so we don't spam.

    if (data.anomaly_overall) {
      // Fetch the last 7 records for this cradle to check history
      const history = await sql`
            SELECT anomaly_overall
            FROM cradle_data
            WHERE cradle_id = ${cradleId}
            ORDER BY created_at DESC
            LIMIT 7
        `;

      // history[0] is the one we just inserted.
      // We want history[0]...history[5] (6 records) to be TRUE.
      // And history[6] (7th record) to be FALSE or undefined.

      const recentAnomalies = history.slice(0, 6);
      const allRecentAreAnomalies = recentAnomalies.length === 6 && recentAnomalies.every(r => r.anomaly_overall);

      const seventhRecord = history[6];
      const transitionDetected = allRecentAreAnomalies && (!seventhRecord || !seventhRecord.anomaly_overall);

      if (transitionDetected) {
        // Get user_id and email for this cradle
        const [cradle] = await sql`
          SELECT c.user_id, c.cradle_name, u.email 
          FROM cradles c
          JOIN users u ON c.user_id = u.id
          WHERE c.id = ${cradleId}
        `;

        console.log(cradle);

        if (cradle) {
          // Identify specific anomalies
          const issues = [];
          if (data.anomaly_temperature) issues.push("Temperature");
          if (data.anomaly_humidity) issues.push("Humidity");
          if (data.anomaly_motion) issues.push("Motion");
          if (data.anomaly_noise) issues.push("Noise");

          const issueText = issues.length > 0 ? issues.join(", ") : "General Anomaly";
          const detailedMessage = `Cradle "${cradle.cradle_name}" report: ${issueText}. Continuous anomalies detected.`;

          // In-App Notification
          await sql`
                    INSERT INTO notifications (
                        user_id, cradle_id, type, alert_key, title, message
                    ) VALUES (
                        ${cradle.user_id}, 
                        ${cradleId}, 
                        'ANOMALY', 
                        'OVERALL', 
                        'High Anomaly Detected',
                        ${detailedMessage}
                    )
                `;

          // Send Email Notification
          await sendEmail(
            cradle.email,
            `Alert: Anomaly Detected in ${cradle.cradle_name}`,
            `<p><strong>High Anomaly Alert</strong></p>
             <p>Your cradle "<strong>${cradle.cradle_name}</strong>" has reported continuous anomalies.</p>
             <p><strong>Detected Issues:</strong> ${issueText}</p>
             <p>Please check the Smart Cradle dashboard for more details.</p>`
          );
        }
      }
    }

    res.json({ status: "ok" });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Duplicate timestamp" });
    }
    console.error("Ingest error:", err);
    res.status(500).json({ error: err.message });
  }
}

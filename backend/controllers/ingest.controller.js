import { sql } from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";
import axios from "axios";
import { getIO } from "../config/webSocket.js";

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

    // Emit real-time update
    try {
      const io = getIO();
      io.to(`cradle_${cradleId}`).emit("new_data", {
        ...data,
        cradle_id: cradleId,
        created_at: new Date().toISOString() // Approximate, or fetch from DB if strict
      });
    } catch (socketErr) {
      console.error("Socket emit failed:", socketErr);
      // Don't block the request if socket fails
    }

    // Check for anomalies and trigger notification if needed
    // ... existing anomaly logic ...
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
          if (data.anomaly_temperature) issues.push("Abnormal Temperature");
          if (data.anomaly_humidity) issues.push("Abnormal Humidity");
          if (data.anomaly_motion) issues.push("Unusual Motion");
          if (data.anomaly_noise) issues.push("Excessive Noise");

          const issueText = issues.length > 0 ? issues.join(", ") : "General Anomaly";

          // Refined message for the notification table
          const notificationTitle = `Anomaly Alert: ${cradle.cradle_name}`;
          const notificationMessage = `Critical anomalies detected: ${issueText}. Please check your cradle immediately.`;

          // In-App Notification
          const [newNotification] = await sql`
                    INSERT INTO notifications (
                        user_id, cradle_id, type, title, message
                    ) VALUES (
                        ${cradle.user_id}, 
                        ${cradleId}, 
                        'ANOMALY', 
                        ${notificationTitle},
                        ${notificationMessage}
                    )
                    RETURNING *
                `;

          // Emit real-time notification
          try {
            const io = getIO();
            io.to(`user_${cradle.user_id}`).emit("new_notification", newNotification);
          } catch (socketErr) {
            console.error("Socket notification emit failed:", socketErr);
          }

          // Send Email Notification - Professional HTML Template
          const emailSubject = `[SmartCradle] Critical Aleart: Anomaly Detected in ${cradle.cradle_name}`;
          const emailHtml = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
              <h2 style="color: #d32f2f; margin-top: 0; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">Critical Anomaly Alert</h2>
              
              <p style="color: #333; font-size: 16px; margin-top: 20px;">Dear Parent,</p>
              
              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Our monitoring system has detected continuous anomalies in the environment of your SmartCradle device <strong>"${cradle.cradle_name}"</strong>.
              </p>

              <div style="background-color: #fff5f5; border-left: 4px solid #d32f2f; padding: 15px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; color: #c62828; font-weight: bold; font-size: 14px; text-transform: uppercase;">Detected Issues</p>
                <p style="margin: 5px 0 0 0; color: #333; font-size: 18px; font-weight: 500;">
                  ${issueText}
                </p>
              </div>

              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Please ensure the baby is safe and check the dashboard for real-time metrics and historical data.
              </p>

              <div style="text-align: center; margin-top: 35px; margin-bottom: 35px;">
                <a href="https://smartcradle.vercel.app/dashboard" style="background-color: #d32f2f; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                  View Live Dashboard
                </a>
              </div>

              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 13px; text-align: center; line-height: 1.5;">
                <strong>SmartCradle Monitoring System</strong><br>
                Ensuring your baby's safety and comfort.<br>
                <span style="font-style: italic;">This is an automated message. Please do not reply.</span>
              </p>
            </div>
          `;

          await sendEmail(cradle.email, emailSubject, emailHtml);
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

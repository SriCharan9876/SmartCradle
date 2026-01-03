import { sql } from "../config/db.js";
import axios from "axios";

async function runVerification() {
    try {
        console.log("Starting verification...");

        // 1. Get a Cradle and Device Key
        const [cradle] = await sql`SELECT id, device_key FROM cradles LIMIT 1`;
        if (!cradle) {
            console.error("No cradles found in DB. Please create a cradle first.");
            process.exit(1);
        }
        console.log(`Using Cradle: ${cradle.id} (Key: ${cradle.device_key})`);

        // 2. Clear recent logs/notifications for clean state (Optional, but good for test)
        // await sql`DELETE FROM cradle_data WHERE cradle_id = ${cradle.id}`;
        // await sql`DELETE FROM notifications WHERE cradle_id = ${cradle.id}`;

        // 3. Send 5 Anomalies
        console.log("Sending 5 Anomalies...");
        for (let i = 1; i <= 5; i++) {
            await sendLog(cradle.device_key, i, true); // anomaly=true
        }

        // 4. Send 6th Anomaly (Should Trigger)
        console.log("Sending 6th Anomaly (Target Trigger)...");
        await sendLog(cradle.device_key, 6, true);

        // 5. Send 7th Anomaly (Should NOT Trigger)
        console.log("Sending 7th Anomaly (Should NOT Trigger)...");
        await sendLog(cradle.device_key, 7, true);

        // 6. Check Notifications
        console.log("Checking DB for Notifications...");
        const notifications = await sql`
        SELECT * FROM notifications 
        WHERE cradle_id = ${cradle.id} 
        ORDER BY created_at DESC 
        LIMIT 5
    `;

        console.log(`Found ${notifications.length} notifications.`);
        if (notifications.length > 0) {
            console.log("Latest Notification:", notifications[0]);
            console.log("SUCCESS: Notification created!");
        } else {
            console.error("FAILURE: No notification found.");
        }

    } catch (err) {
        console.error("Verification failed:", err);
    } finally {
        process.exit(0);
    }
}

async function sendLog(deviceKey, seq, isAnomaly) {
    const uptime = Date.now(); // Using fake uptime/timestamp unique
    const payload = {
        boot_id: "verify-script",
        uptime_seconds: uptime,
        temperature: 25.0,
        humidity: 50.0,
        sound_level: 40.0,
        motion_state: "Normal",
        acc_x: 0, acc_y: 0, acc_z: 1,
        confidence_idle: 0, confidence_normal: 100, confidence_shake: 0, confidence_tilt: 0,
        anomaly_temperature: false,
        anomaly_humidity: false,
        anomaly_motion: false,
        anomaly_noise: false,
        anomaly_overall: isAnomaly
    };

    try {
        const response = await axios.post("http://localhost:5000/api/ingest/log", payload, {
            headers: {
                "x-device-key": deviceKey
            }
        });

        // console.log(`Log ${seq} sent.`);
    } catch (e) {
        console.error(`Error sending log ${seq}: Is server running on 5000?`, e.message);
        if (e.response) {
            console.error("Response data:", e.response.data);
        }
    }
}

runVerification();

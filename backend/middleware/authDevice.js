import { sql } from "../config/db.js";

export async function authDevice(req, res, next) {
  const deviceKey = req.headers["x-device-key"];

  if (!deviceKey) {
    return res.status(401).json({ error: "Device key missing" });
  }

  const [cradle] = await sql`
    SELECT id, user_id FROM cradles WHERE device_key = ${deviceKey}
  `;

  if (!cradle) {
    return res.status(401).json({ error: "Invalid device key" });
  }

  req.cradleId = cradle.id;
  req.userId = cradle.user_id;
  next();
}

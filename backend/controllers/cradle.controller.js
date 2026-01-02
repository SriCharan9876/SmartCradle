import { sql } from "../config/db.js";

export async function getCradles(req, res) {
  const cradles = await sql`
    SELECT id, cradle_name, location
    FROM cradles
    WHERE user_id = ${req.user.id}
  `;
  res.json(cradles);
}

export async function getLatestStatus(req, res) {
  const [row] = await sql`
    SELECT *
    FROM cradle_data
    WHERE cradle_id = ${req.params.cradleId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  res.json(row);
}

export async function getHistory(req, res) {
  const limit = Number(req.query.limit || 50);

  const rows = await sql`
    SELECT created_at, temperature, humidity, anomaly_overall
    FROM cradle_data
    WHERE cradle_id = ${req.params.cradleId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  res.json(rows);
}

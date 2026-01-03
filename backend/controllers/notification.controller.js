import { sql } from "../config/db.js";

export async function getNotifications(req, res) {
    try {
        const notifications = await sql`
      SELECT n.*, c.cradle_name
      FROM notifications n
      JOIN cradles c ON n.cradle_id = c.id
      WHERE n.user_id = ${req.user.id}
      ORDER BY n.created_at DESC
      LIMIT 50
    `;
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function markAsRead(req, res) {
    const { id } = req.params;
    try {
        const [updated] = await sql`
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ${id} AND user_id = ${req.user.id}
      RETURNING *
    `;

        if (!updated) {
            return res.status(404).json({ error: "Notification not found or unauthorized" });
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function markAllAsRead(req, res) {
    try {
        await sql`
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = ${req.user.id} AND is_read = FALSE
    `;
        res.json({ status: "ok" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

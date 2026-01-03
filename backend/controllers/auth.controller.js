import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sql } from "../config/db.js";

export async function register(req, res) {
  const { email, password, display_name, photo_url } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  try {
    await sql`
      INSERT INTO users (email, password, display_name, photo_url)
      VALUES (${email}, ${hashed}, ${display_name}, ${photo_url})
    `;
    res.json({ message: "User registered" });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  const [user] = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
}

export async function getMe(req, res) {
  try {
    const [user] = await sql`
      SELECT id, email, display_name, photo_url, created_at, provider
      FROM users
      WHERE id = ${req.user.id}
    `;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

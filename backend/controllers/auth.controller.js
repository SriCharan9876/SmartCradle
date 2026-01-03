import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sql } from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function register(req, res) {
  const { email } = req.body;

  try {
    // Check if user already exists
    const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    // Store in user_otps
    await sql`
      INSERT INTO user_otps (email, otp_code, expires_at)
      VALUES (${email}, ${otp}, ${expiresAt})
      ON CONFLICT (email)
      DO UPDATE SET
        otp_code = EXCLUDED.otp_code,
        expires_at = EXCLUDED.expires_at
    `;

    // Send email
    await sendEmail(
      email,
      "Smart Cradle - Verify your email",
      `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
    );

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function verifyEmail(req, res) {
  const { email, otp, password, display_name, photo_url } = req.body;

  try {
    const [record] = await sql`
      SELECT * FROM user_otps WHERE email = ${email}
    `;

    if (!record) {
      return res.status(400).json({ error: "Invalid or expired verification request" });
    }

    if (record.otp_code !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create User
    const [newUser] = await sql`
      INSERT INTO users (email, password, display_name, photo_url)
      VALUES (${email}, ${hashed}, ${display_name}, ${photo_url})
      RETURNING id, email
    `;

    // Clean up OTP
    await sql`DELETE FROM user_otps WHERE email = ${email}`;

    // Login (Generate Token)
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, message: "Verification successful" });

  } catch (err) {
    if (err.code === "23505") { // Unique violation in users table
      return res.status(409).json({ error: "Email already verified/exists" });
    }
    console.error(err);
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

import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleLogin(req, res) {
  const { token } = req.body;

  try {
    console.log(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let [user] = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (!user) {
      // Create new user
      // Note: We don't have a password for Google users.
      // You might want to ensure your schema allows null passwords or handle it.
      // Based on schema inspection, password IS NOT NULL? No, schema says `password TEXT` (nullable by default in SQL unless NOT NULL specified).
      // Let's check schema again. `password TEXT`. It is nullable. Good.

      [user] = await sql`
        INSERT INTO users (email, display_name, photo_url, provider)
        VALUES (${email}, ${name}, ${picture}, 'google')
        RETURNING *
      `;
    } else {
      // Optional: Update info if needed?
      // For now, just login.
    }

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token: jwtToken });

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ error: "Invalid Google Token" });
  }
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

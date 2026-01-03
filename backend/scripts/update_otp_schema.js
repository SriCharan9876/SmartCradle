import { sql } from "../config/db.js";

async function main() {
    console.log("Updating database schema...");

    try {
        // 1. Drop existing user_otps if it exists to clean slate (or just alter it)
        // To be safe and clean, we'll recreate it since it's a temp table anyway.
        await sql`DROP TABLE IF EXISTS user_otps`;

        // 2. Create user_otps with new columns
        await sql`
      CREATE TABLE user_otps (
        id BIGSERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        otp_code TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        UNIQUE (email)
      )
    `;

        console.log("Schema updated successfully: user_otps table recreated.");
    } catch (err) {
        console.error("Error updating schema:", err);
    } finally {
        process.exit();
    }
}

main();

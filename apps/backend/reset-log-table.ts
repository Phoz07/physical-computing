import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function resetLogTable() {
  try {
    console.log("Dropping existing log table if exists...");
    await db.execute(sql`DROP TABLE IF EXISTS log CASCADE`);

    console.log("Creating log table...");
    await db.execute(sql`
      CREATE TABLE "log" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "image" text,
        "is_open" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    console.log("✅ Log table created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

resetLogTable();

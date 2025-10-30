import "dotenv/config";
import { db } from "./src/db";
import { logTable } from "./src/db/schema/log";

async function seedData() {
  try {
    console.log("Adding sample log entries...");

    const sampleLogs = [
      { image: null, isOpen: true },
      { image: null, isOpen: false },
      { image: null, isOpen: true },
      { image: null, isOpen: true },
      { image: null, isOpen: false },
    ];

    for (const log of sampleLogs) {
      await db.insert(logTable).values(log);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for different timestamps
    }

    console.log("✅ Sample data added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedData();

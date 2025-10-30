import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const configTable = pgTable("config", {
  id:uuid().defaultRandom(),
  webhookUrl: text("webhook_url"),
})
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const configTable = pgTable("config", {
  id: uuid("id").defaultRandom().primaryKey(),
  webhookUrl: text("webhook_url"),
});
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const logTable = pgTable("log", {
  id: uuid("id").defaultRandom().primaryKey(),
  image: text("image"),
  isOpen: boolean("is_open").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull()
})
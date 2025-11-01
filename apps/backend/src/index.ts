import { Elysia, t } from "elysia";
import { db } from "./db";
import { logTable } from "./db/schema/log";
import { configTable } from "./db/schema/config";
import { desc, sql } from "drizzle-orm";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import openapi from "@elysiajs/openapi";

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({ assets: "uploads", prefix: "/uploads" }))
  .use(openapi())
  .get("/api/status", () => ({ isOnline: true }))

  // Get logs with pagination
  .get("/logs", async ({ query }) => {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const offset = (page - 1) * limit;

    try {
      const logs = await db
        .select()
        .from(logTable)
        .orderBy(desc(logTable.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(logTable);

      return {
        data: logs,
        pagination: {
          page,
          limit,
          total: Number(count),
          totalPages: Math.ceil(Number(count) / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching logs:", error);
      return { error: "Failed to fetch logs" };
    }
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })

  // Get config (single row)
  .get("/config", async () => {
    try {
      const rows = await db.select().from(configTable).limit(1);
      if (!rows || rows.length === 0) {
        return { data: null };
      }
      return { data: rows[0] };
    } catch (error) {
      console.error("Error fetching config:", error);
      return { error: "Failed to fetch config" };
    }
  })

  // Create or update config
  .post("/config", async ({ body }) => {
    try {
      // Try to find existing row
      const [existing] = await db.select().from(configTable).limit(1);

      if (existing) {
        // Update existing
        await db
          .update(configTable)
          .set({ webhookUrl: body.webhookUrl })
          .where(sql`${configTable.id} = ${existing.id}`);

        const [updated] = await db.select().from(configTable).where(sql`${configTable.id} = ${existing.id}`);
        return { success: true, data: updated };
      }

      // Insert new
      const [created] = await db.insert(configTable).values({ webhookUrl: body.webhookUrl }).returning();
      return { success: true, data: created };
    } catch (error) {
      console.error("Error upserting config:", error);
      return { error: "Failed to create/update config" };
    }
  }, {
    body: t.Object({
      webhookUrl: t.String(),
    }),
  })

  // Upload image
  .post("/upload", async ({ body }) => {
    try {
      const file = body.file;
      if (!file) {
        return { error: "No file provided" };
      }

      const filename = `${Date.now()}-${file.name}`;
      const filepath = `uploads/${filename}`;

      await Bun.write(filepath, file);

      return {
        success: true,
        path: `/uploads/${filename}`,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      return { error: "Failed to upload file" };
    }
  }, {
    body: t.Object({
      file: t.File(),
    }),
  })

  // Create log entry
  .post("/logs", async ({ body }) => {
    try {
      const [log] = await db
        .insert(logTable)
        .values({
          image: body.image,
          isOpen: body.isOpen,
        })
        .returning();

      return { success: true, data: log };
    } catch (error) {
      console.error("Error creating log:", error);
      return { error: "Failed to create log" };
    }
  }, {
    body: t.Object({
      image: t.Optional(t.String()),
      isOpen: t.Boolean(),
    }),
  })

  .listen(3001);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

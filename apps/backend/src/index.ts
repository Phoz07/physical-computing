import { Elysia, t } from "elysia";
import { db } from "./db";
import { logTable } from "./db/schema/log";
import { desc, sql } from "drizzle-orm";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({ assets: "uploads", prefix: "/uploads" }))
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
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

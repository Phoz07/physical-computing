import { env } from "cloudflare:workers";
import { auth } from "./lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { upgradeWebSocket } from "hono/cloudflare-workers";

const app = new Hono()

  .use(logger())
  .use(
    "/*",
    cors({
      origin: env.CORS_ORIGIN || "",
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  )

  .on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))

  .get("/", (c) => {
    return c.text("OK");
  })
  .get(
    "/steam",
    upgradeWebSocket((c) => {
      return {
        async onMessage(evt, ws) {
			console.log(evt.origin);
          if (evt.data instanceof Blob) {
            const arrayBuffer = await evt.data.arrayBuffer();
            ws.send(new Uint8Array(arrayBuffer));
          } else if (typeof evt.data === "string") {
            ws.send(evt.data);
          } else if (evt.data instanceof ArrayBuffer) {
            ws.send(new Uint8Array(evt.data));
          } else if (evt.data instanceof Uint8Array) {
            ws.send(evt.data);
          } else {
          }
        },
      };
    })
  );

export default app;

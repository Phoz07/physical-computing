CREATE TABLE "config" (
	"id" uuid DEFAULT gen_random_uuid(),
	"webhook_url" text
);

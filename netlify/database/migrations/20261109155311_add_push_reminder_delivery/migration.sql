CREATE TABLE "notification_deliveries" (
	"key" text PRIMARY KEY,
	"claimed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_configuration" (
	"id" integer PRIMARY KEY,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL
);

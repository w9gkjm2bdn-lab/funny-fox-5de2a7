CREATE TABLE "login_failures" (
	"id" serial PRIMARY KEY,
	"username" text NOT NULL,
	"ip" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "login_failures_username_created_at_idx" ON "login_failures" ("username","created_at");--> statement-breakpoint
CREATE INDEX "login_failures_ip_created_at_idx" ON "login_failures" ("ip","created_at");
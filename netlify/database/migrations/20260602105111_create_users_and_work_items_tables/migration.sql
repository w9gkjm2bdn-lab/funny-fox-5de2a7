CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"username" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_items" (
	"id" serial PRIMARY KEY,
	"customer_name" text NOT NULL,
	"site" text NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"notes" text,
	"whats_required" text NOT NULL,
	"where_needs_measuring" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

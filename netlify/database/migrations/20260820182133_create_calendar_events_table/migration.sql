CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"end_date" text,
	"notes" text,
	"event_type" text DEFAULT 'general' NOT NULL,
	"assigned_to" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

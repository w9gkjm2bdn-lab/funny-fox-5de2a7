ALTER TABLE "work_items" ADD COLUMN IF NOT EXISTS "samples" text;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN IF NOT EXISTS "measured_by" text;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN IF NOT EXISTS "carpet_ordered_date" text;
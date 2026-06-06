ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "display_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image_url" text;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN IF NOT EXISTS "samples" text;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN IF NOT EXISTS "assigned_to" text;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN IF NOT EXISTS "measured_by" text;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN IF NOT EXISTS "carpet_ordered_date" text;

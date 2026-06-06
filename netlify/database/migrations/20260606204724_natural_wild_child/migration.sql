ALTER TABLE "users" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN "samples" text;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN "assigned_to" text;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN "measured_by" text;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN "carpet_ordered_date" text;
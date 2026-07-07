ALTER TABLE "work_items" ADD COLUMN "customer_phone" text;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN "google_drive_url" text;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN "uplift_and_disposal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN "furniture" boolean DEFAULT false NOT NULL;
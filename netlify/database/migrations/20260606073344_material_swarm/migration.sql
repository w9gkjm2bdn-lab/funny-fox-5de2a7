ALTER TABLE "users" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN "carpet_and_flooring_ordered" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN "measured_booked" text;--> statement-breakpoint
ALTER TABLE "work_items" ADD COLUMN "fitting_date" text;
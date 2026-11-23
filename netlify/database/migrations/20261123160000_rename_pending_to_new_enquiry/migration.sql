ALTER TABLE "work_items" ALTER COLUMN "status" SET DEFAULT 'New enquiry';--> statement-breakpoint
UPDATE "work_items" SET "status" = 'New enquiry' WHERE "status" = 'Pending';
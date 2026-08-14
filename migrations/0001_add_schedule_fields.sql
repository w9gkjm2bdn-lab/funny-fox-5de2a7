-- migrations/0001_add_schedule_fields.sql
-- Add scheduling fields to work_items
-- Run this migration against your Postgres DB (e.g., psql or your migration runner)

ALTER TABLE work_items
  ADD COLUMN IF NOT EXISTS scheduled_start timestamptz NULL,
  ADD COLUMN IF NOT EXISTS scheduled_end timestamptz NULL,
  ADD COLUMN IF NOT EXISTS is_all_day boolean NOT NULL DEFAULT false;

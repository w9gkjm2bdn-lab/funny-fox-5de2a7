import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  imageUrl: text("image_url"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workItems = pgTable("work_items", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  site: text("site").notNull(),
  status: text("status").notNull().default("Pending"),
  notes: text("notes"),
  whatsRequired: text("whats_required").notNull(),
  whereNeedsMeasuring: text("where_needs_measuring").notNull(),
  googleDriveUrl: text("google_drive_url"),
  samples: text("samples"),
  carpetAndFlooringOrdered: boolean("carpet_and_flooring_ordered").notNull().default(false),
  upliftAndDisposal: boolean("uplift_and_disposal").notNull().default(false),
  furniture: boolean("furniture").notNull().default(false),
  assignedTo: text("assigned_to"),
  measuredBy: text("measured_by"),
  measuredBooked: text("measured_booked"),
  fittingDate: text("fitting_date"),
  carpetOrderedDate: text("carpet_ordered_date"),
  carpetCostPerSqm: text("carpet_cost_per_sqm"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

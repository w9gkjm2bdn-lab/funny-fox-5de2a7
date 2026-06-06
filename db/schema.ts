import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workItems = pgTable("work_items", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  site: text("site").notNull(),
  status: text("status").notNull().default("Pending"),
  notes: text("notes"),
  whatsRequired: text("whats_required").notNull(),
  whereNeedsMeasuring: text("where_needs_measuring").notNull(),
  samples: text("samples"),
  carpetAndFlooringOrdered: boolean("carpet_and_flooring_ordered").notNull().default(false),
  measuredBooked: text("measured_booked"),
  fittingDate: text("fitting_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

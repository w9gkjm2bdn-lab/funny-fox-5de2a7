import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const quoteRequests = sqliteTable("quote_requests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  service: text("service").notNull(),
  pickupDate: text("pickup_date").notNull().default(""),
  details: text("details").notNull().default(""),
  status: text("status").notNull().default("new"),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("idx_quote_requests_email_created_at").on(table.email, table.createdAt)]);

export const driverApplications = sqliteTable("driver_applications", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  payloadJson: text("payload_json").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("idx_driver_applications_email_created_at").on(table.email, table.createdAt)]);

export const carrierInquiries = sqliteTable("carrier_inquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  payloadJson: text("payload_json").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("idx_carrier_inquiries_email_created_at").on(table.email, table.createdAt)]);

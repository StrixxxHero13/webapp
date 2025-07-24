import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  plate: text("plate").notNull().unique(),
  model: text("model").notNull(),
  make: text("make").notNull(),
  year: integer("year").notNull(),
  type: text("type").notNull(), // "utilitaire", "camion", "voiture"
  mileage: integer("mileage").notNull().default(0),
  status: text("status").notNull().default("operational"), // "operational", "maintenance_due", "in_repair"
  createdAt: timestamp("created_at").defaultNow(),
});

export const parts = pgTable("parts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  reference: text("reference").notNull().unique(),
  category: text("category").notNull(), // "filtres", "freinage", "moteur", "pneumatiques"
  stock: integer("stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(5),
  unitPrice: integer("unit_price").notNull(), // in cents
  createdAt: timestamp("created_at").defaultNow(),
});

export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  type: text("type").notNull(), // "vidange", "controle_technique", "revision", "reparation"
  description: text("description").notNull(),
  cost: integer("cost").notNull(), // in cents
  duration: integer("duration").notNull(), // in minutes
  technician: text("technician").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  nextDue: timestamp("next_due"),
});

export const partUsage = pgTable("part_usage", {
  id: serial("id").primaryKey(),
  maintenanceId: integer("maintenance_id").references(() => maintenanceRecords.id).notNull(),
  partId: integer("part_id").references(() => parts.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  type: text("type").notNull(), // "maintenance_due", "overdue", "inspection_needed"
  message: text("message").notNull(),
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high", "urgent"
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const insertPartSchema = createInsertSchema(parts).omit({
  id: true,
  createdAt: true,
});

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({
  id: true,
  completedAt: true,
  nextDue: true,
}).extend({
  cost: z.number().min(0).default(0),
  duration: z.number().min(1).default(60), // default to 60 minutes
  technician: z.string().min(1).default("Technicien système"), // default technician
});

export const insertPartUsageSchema = createInsertSchema(partUsage).omit({
  id: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Part = typeof parts.$inferSelect;
export type InsertPart = z.infer<typeof insertPartSchema>;
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;
export type PartUsage = typeof partUsage.$inferSelect;
export type InsertPartUsage = z.infer<typeof insertPartUsageSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

// Extended types for frontend
export type VehicleWithAlerts = Vehicle & {
  alerts: Alert[];
  lastMaintenance?: MaintenanceRecord;
};

export type MaintenanceWithParts = MaintenanceRecord & {
  vehicle: Vehicle;
  partsUsed: (PartUsage & { part: Part })[];
};

export type PartWithStatus = Part & {
  status: "in_stock" | "low_stock" | "out_of_stock";
};

// Relations
export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  maintenanceRecords: many(maintenanceRecords),
  alerts: many(alerts),
}));

export const maintenanceRecordsRelations = relations(maintenanceRecords, ({ one, many }) => ({
  vehicle: one(vehicles, {
    fields: [maintenanceRecords.vehicleId],
    references: [vehicles.id],
  }),
  partUsages: many(partUsage),
}));

export const partUsageRelations = relations(partUsage, ({ one }) => ({
  maintenanceRecord: one(maintenanceRecords, {
    fields: [partUsage.maintenanceId],
    references: [maintenanceRecords.id],
  }),
  part: one(parts, {
    fields: [partUsage.partId],
    references: [parts.id],
  }),
}));

export const partsRelations = relations(parts, ({ many }) => ({
  partUsages: many(partUsage),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [alerts.vehicleId],
    references: [vehicles.id],
  }),
}));

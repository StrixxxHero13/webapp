import { 
  vehicles, parts, maintenanceRecords, partUsage, alerts,
  type Vehicle, type InsertVehicle, type Part, type InsertPart,
  type MaintenanceRecord, type InsertMaintenanceRecord,
  type PartUsage, type InsertPartUsage, type Alert, type InsertAlert,
  type VehicleWithAlerts, type MaintenanceWithParts, type PartWithStatus
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehicleWithAlerts(id: number): Promise<VehicleWithAlerts | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;

  // Parts
  getParts(): Promise<Part[]>;
  getPartsWithStatus(): Promise<PartWithStatus[]>;
  getPart(id: number): Promise<Part | undefined>;
  createPart(part: InsertPart): Promise<Part>;
  updatePart(id: number, part: Partial<InsertPart>): Promise<Part | undefined>;
  deletePart(id: number): Promise<boolean>;

  // Maintenance Records
  getMaintenanceRecords(): Promise<MaintenanceRecord[]>;
  getMaintenanceRecordsWithParts(): Promise<MaintenanceWithParts[]>;
  getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined>;
  getMaintenanceRecordsByVehicle(vehicleId: number): Promise<MaintenanceRecord[]>;
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: number, record: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined>;
  deleteMaintenanceRecord(id: number): Promise<boolean>;

  // Part Usage
  getPartUsage(maintenanceId: number): Promise<(PartUsage & { part: Part })[]>;
  createPartUsage(usage: InsertPartUsage): Promise<PartUsage>;

  // Alerts
  getAlerts(): Promise<Alert[]>;
  getAlertsByVehicle(vehicleId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: number): Promise<boolean>;
  deleteAlert(id: number): Promise<boolean>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalVehicles: number;
    operational: number;
    maintenanceDue: number;
    inRepair: number;
    totalParts: number;
    partsInStock: number;
    partsLowStock: number;
    partsOutOfStock: number;
    unreadAlerts: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize sample data on first use
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    try {
      // Check if data already exists
      const existingVehicles = await db.select().from(vehicles).limit(1);
      if (existingVehicles.length > 0) return;

      // Sample vehicles
      const sampleVehicles = [
        { plate: "ABC-123-FR", model: "Master", make: "Renault", year: 2020, type: "utilitaire", mileage: 125430, status: "operational" },
        { plate: "XYZ-789-FR", model: "Partner", make: "Peugeot", year: 2019, type: "utilitaire", mileage: 89750, status: "maintenance_due" },
        { plate: "DEF-456-FR", model: "Transit", make: "Ford", year: 2018, type: "utilitaire", mileage: 156890, status: "in_repair" },
      ];

      const insertedVehicles = await db.insert(vehicles).values(sampleVehicles).returning();

      // Sample parts
      const sampleParts = [
        { name: "Filtre à huile", reference: "FLT-001-D", category: "filtres", stock: 25, minStock: 5, unitPrice: 1250 },
        { name: "Plaquettes de frein", reference: "BRK-002-F", category: "freinage", stock: 3, minStock: 5, unitPrice: 4500 },
        { name: "Batterie 12V", reference: "BAT-003-70", category: "moteur", stock: 0, minStock: 2, unitPrice: 8500 },
        { name: "Pneu 215/75 R16", reference: "TYR-004-16", category: "pneumatiques", stock: 8, minStock: 4, unitPrice: 12000 },
      ];

      await db.insert(parts).values(sampleParts);

      // Sample maintenance records
      const sampleMaintenance = [
        { vehicleId: insertedVehicles[0].id, type: "vidange", description: "Vidange moteur + filtre", cost: 6500, duration: 90, technician: "J. Dubois", completedAt: new Date('2024-01-08'), nextDue: new Date('2024-07-08') },
        { vehicleId: insertedVehicles[1].id, type: "reparation", description: "Remplacement plaquettes frein", cost: 12000, duration: 165, technician: "M. Martin", completedAt: new Date('2024-01-05'), nextDue: null },
        { vehicleId: insertedVehicles[2].id, type: "controle_technique", description: "Contrôle technique périodique", cost: 7800, duration: 60, technician: "Auto Control+", completedAt: new Date('2023-12-22'), nextDue: new Date('2024-12-22') },
      ];

      await db.insert(maintenanceRecords).values(sampleMaintenance as any);

      // Sample alerts
      const sampleAlerts = [
        { vehicleId: insertedVehicles[0].id, type: "maintenance_due", message: "Vidange prévue dans 7 jours", priority: "medium", isRead: false },
        { vehicleId: insertedVehicles[1].id, type: "overdue", message: "Contrôle technique expiré depuis 3 jours", priority: "urgent", isRead: false },
        { vehicleId: insertedVehicles[2].id, type: "inspection_needed", message: "Plaquettes de frein à vérifier", priority: "high", isRead: false },
      ];

      await db.insert(alerts).values(sampleAlerts);
    } catch (error) {
      console.log("Sample data initialization skipped (likely already exists)");
    }
  }

  // Vehicle methods
  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async getVehicleWithAlerts(id: number): Promise<VehicleWithAlerts | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    if (!vehicle) return undefined;

    const vehicleAlerts = await db.select().from(alerts).where(eq(alerts.vehicleId, id));
    const lastMaintenanceRecords = await db
      .select()
      .from(maintenanceRecords)
      .where(eq(maintenanceRecords.vehicleId, id))
      .orderBy(desc(maintenanceRecords.completedAt))
      .limit(1);

    return { 
      ...vehicle, 
      alerts: vehicleAlerts, 
      lastMaintenance: lastMaintenanceRecords[0] 
    };
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [updated] = await db
      .update(vehicles)
      .set(vehicle)
      .where(eq(vehicles.id, id))
      .returning();
    return updated;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Parts methods
  async getParts(): Promise<Part[]> {
    return await db.select().from(parts);
  }

  async getPartsWithStatus(): Promise<PartWithStatus[]> {
    const allParts = await db.select().from(parts);
    return allParts.map(part => ({
      ...part,
      status: part.stock === 0 ? "out_of_stock" : part.stock <= part.minStock ? "low_stock" : "in_stock"
    }));
  }

  async getPart(id: number): Promise<Part | undefined> {
    const [part] = await db.select().from(parts).where(eq(parts.id, id));
    return part;
  }

  async createPart(part: InsertPart): Promise<Part> {
    const [newPart] = await db.insert(parts).values(part).returning();
    return newPart;
  }

  async updatePart(id: number, part: Partial<InsertPart>): Promise<Part | undefined> {
    const [updated] = await db
      .update(parts)
      .set(part)
      .where(eq(parts.id, id))
      .returning();
    return updated;
  }

  async deletePart(id: number): Promise<boolean> {
    const result = await db.delete(parts).where(eq(parts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Maintenance methods
  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return await db.select().from(maintenanceRecords);
  }

  async getMaintenanceRecordsWithParts(): Promise<MaintenanceWithParts[]> {
    const records = await db.select().from(maintenanceRecords);
    const result = [];
    
    for (const record of records) {
      const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, record.vehicleId));
      const usages = await db.select().from(partUsage).where(eq(partUsage.maintenanceId, record.id));
      
      const partsUsed = [];
      for (const usage of usages) {
        const [part] = await db.select().from(parts).where(eq(parts.id, usage.partId));
        partsUsed.push({ ...usage, part });
      }
      
      result.push({ ...record, vehicle, partsUsed });
    }
    
    return result;
  }

  async getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined> {
    const [record] = await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.id, id));
    return record;
  }

  async getMaintenanceRecordsByVehicle(vehicleId: number): Promise<MaintenanceRecord[]> {
    return await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.vehicleId, vehicleId));
  }

  async createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [newRecord] = await db.insert(maintenanceRecords).values(record as any).returning();
    return newRecord;
  }

  async updateMaintenanceRecord(id: number, record: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined> {
    const [updated] = await db
      .update(maintenanceRecords)
      .set(record)
      .where(eq(maintenanceRecords.id, id))
      .returning();
    return updated;
  }

  async deleteMaintenanceRecord(id: number): Promise<boolean> {
    const result = await db.delete(maintenanceRecords).where(eq(maintenanceRecords.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Part usage methods
  async getPartUsage(maintenanceId: number): Promise<(PartUsage & { part: Part })[]> {
    const usages = await db.select().from(partUsage).where(eq(partUsage.maintenanceId, maintenanceId));
    const result = [];
    
    for (const usage of usages) {
      const [part] = await db.select().from(parts).where(eq(parts.id, usage.partId));
      result.push({ ...usage, part });
    }
    
    return result;
  }

  async createPartUsage(usage: InsertPartUsage): Promise<PartUsage> {
    const [newUsage] = await db.insert(partUsage).values(usage).returning();
    return newUsage;
  }

  // Alert methods
  async getAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts);
  }

  async getAlertsByVehicle(vehicleId: number): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.vehicleId, vehicleId));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async markAlertAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(alerts)
      .set({ isRead: true })
      .where(eq(alerts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteAlert(id: number): Promise<boolean> {
    const result = await db.delete(alerts).where(eq(alerts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalVehicles: number;
    operational: number;
    maintenanceDue: number;
    inRepair: number;
    totalParts: number;
    partsInStock: number;
    partsLowStock: number;
    partsOutOfStock: number;
    unreadAlerts: number;
  }> {
    const allVehicles = await db.select().from(vehicles);
    const allParts = await db.select().from(parts);
    const allAlerts = await db.select().from(alerts);

    return {
      totalVehicles: allVehicles.length,
      operational: allVehicles.filter(v => v.status === "operational").length,
      maintenanceDue: allVehicles.filter(v => v.status === "maintenance_due").length,
      inRepair: allVehicles.filter(v => v.status === "in_repair").length,
      totalParts: allParts.length,
      partsInStock: allParts.filter(p => p.stock > p.minStock).length,
      partsLowStock: allParts.filter(p => p.stock > 0 && p.stock <= p.minStock).length,
      partsOutOfStock: allParts.filter(p => p.stock === 0).length,
      unreadAlerts: allAlerts.filter(a => !a.isRead).length,
    };
  }
}

export const storage = new DatabaseStorage();

import { 
  vehicles, parts, maintenanceRecords, partUsage, alerts,
  type Vehicle, type InsertVehicle, type Part, type InsertPart,
  type MaintenanceRecord, type InsertMaintenanceRecord,
  type PartUsage, type InsertPartUsage, type Alert, type InsertAlert,
  type VehicleWithAlerts, type MaintenanceWithParts, type PartWithStatus
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private vehicles: Map<number, Vehicle>;
  private parts: Map<number, Part>;
  private maintenanceRecords: Map<number, MaintenanceRecord>;
  private partUsage: Map<number, PartUsage>;
  private alerts: Map<number, Alert>;
  private currentVehicleId: number;
  private currentPartId: number;
  private currentMaintenanceId: number;
  private currentPartUsageId: number;
  private currentAlertId: number;

  constructor() {
    this.vehicles = new Map();
    this.parts = new Map();
    this.maintenanceRecords = new Map();
    this.partUsage = new Map();
    this.alerts = new Map();
    this.currentVehicleId = 1;
    this.currentPartId = 1;
    this.currentMaintenanceId = 1;
    this.currentPartUsageId = 1;
    this.currentAlertId = 1;

    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample vehicles
    const sampleVehicles = [
      { plate: "ABC-123-FR", model: "Master", make: "Renault", year: 2020, type: "utilitaire", mileage: 125430, status: "operational" },
      { plate: "XYZ-789-FR", model: "Partner", make: "Peugeot", year: 2019, type: "utilitaire", mileage: 89750, status: "maintenance_due" },
      { plate: "DEF-456-FR", model: "Transit", make: "Ford", year: 2018, type: "utilitaire", mileage: 156890, status: "in_repair" },
    ];

    sampleVehicles.forEach(vehicle => {
      const id = this.currentVehicleId++;
      this.vehicles.set(id, { ...vehicle, id, createdAt: new Date() });
    });

    // Sample parts
    const sampleParts = [
      { name: "Filtre à huile", reference: "FLT-001-D", category: "filtres", stock: 25, minStock: 5, unitPrice: 1250 },
      { name: "Plaquettes de frein", reference: "BRK-002-F", category: "freinage", stock: 3, minStock: 5, unitPrice: 4500 },
      { name: "Batterie 12V", reference: "BAT-003-70", category: "moteur", stock: 0, minStock: 2, unitPrice: 8500 },
      { name: "Pneu 215/75 R16", reference: "TYR-004-16", category: "pneumatiques", stock: 8, minStock: 4, unitPrice: 12000 },
    ];

    sampleParts.forEach(part => {
      const id = this.currentPartId++;
      this.parts.set(id, { ...part, id, createdAt: new Date() });
    });

    // Sample maintenance records
    const sampleMaintenance = [
      { vehicleId: 1, type: "vidange", description: "Vidange moteur + filtre", cost: 6500, duration: 90, technician: "J. Dubois", completedAt: new Date('2024-01-08'), nextDue: new Date('2024-07-08') },
      { vehicleId: 2, type: "reparation", description: "Remplacement plaquettes frein", cost: 12000, duration: 165, technician: "M. Martin", completedAt: new Date('2024-01-05'), nextDue: null },
      { vehicleId: 3, type: "controle_technique", description: "Contrôle technique périodique", cost: 7800, duration: 60, technician: "Auto Control+", completedAt: new Date('2023-12-22'), nextDue: new Date('2024-12-22') },
    ];

    sampleMaintenance.forEach(maintenance => {
      const id = this.currentMaintenanceId++;
      this.maintenanceRecords.set(id, { ...maintenance, id });
    });

    // Sample alerts
    const sampleAlerts = [
      { vehicleId: 1, type: "maintenance_due", message: "Vidange prévue dans 7 jours", priority: "medium", isRead: false },
      { vehicleId: 2, type: "overdue", message: "Contrôle technique expiré depuis 3 jours", priority: "urgent", isRead: false },
      { vehicleId: 3, type: "inspection_needed", message: "Plaquettes de frein à vérifier", priority: "high", isRead: false },
    ];

    sampleAlerts.forEach(alert => {
      const id = this.currentAlertId++;
      this.alerts.set(id, { ...alert, id, createdAt: new Date() });
    });
  }

  // Vehicle methods
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehicleWithAlerts(id: number): Promise<VehicleWithAlerts | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;

    const vehicleAlerts = Array.from(this.alerts.values()).filter(alert => alert.vehicleId === id);
    const lastMaintenance = Array.from(this.maintenanceRecords.values())
      .filter(record => record.vehicleId === id)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

    return { ...vehicle, alerts: vehicleAlerts, lastMaintenance };
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentVehicleId++;
    const newVehicle: Vehicle = { ...vehicle, id, createdAt: new Date() };
    this.vehicles.set(id, newVehicle);
    return newVehicle;
  }

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const existing = this.vehicles.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...vehicle };
    this.vehicles.set(id, updated);
    return updated;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // Parts methods
  async getParts(): Promise<Part[]> {
    return Array.from(this.parts.values());
  }

  async getPartsWithStatus(): Promise<PartWithStatus[]> {
    return Array.from(this.parts.values()).map(part => ({
      ...part,
      status: part.stock === 0 ? "out_of_stock" : part.stock <= part.minStock ? "low_stock" : "in_stock"
    }));
  }

  async getPart(id: number): Promise<Part | undefined> {
    return this.parts.get(id);
  }

  async createPart(part: InsertPart): Promise<Part> {
    const id = this.currentPartId++;
    const newPart: Part = { ...part, id, createdAt: new Date() };
    this.parts.set(id, newPart);
    return newPart;
  }

  async updatePart(id: number, part: Partial<InsertPart>): Promise<Part | undefined> {
    const existing = this.parts.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...part };
    this.parts.set(id, updated);
    return updated;
  }

  async deletePart(id: number): Promise<boolean> {
    return this.parts.delete(id);
  }

  // Maintenance methods
  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return Array.from(this.maintenanceRecords.values());
  }

  async getMaintenanceRecordsWithParts(): Promise<MaintenanceWithParts[]> {
    return Array.from(this.maintenanceRecords.values()).map(record => {
      const vehicle = this.vehicles.get(record.vehicleId)!;
      const partsUsed = Array.from(this.partUsage.values())
        .filter(usage => usage.maintenanceId === record.id)
        .map(usage => ({
          ...usage,
          part: this.parts.get(usage.partId)!
        }));
      
      return { ...record, vehicle, partsUsed };
    });
  }

  async getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined> {
    return this.maintenanceRecords.get(id);
  }

  async getMaintenanceRecordsByVehicle(vehicleId: number): Promise<MaintenanceRecord[]> {
    return Array.from(this.maintenanceRecords.values()).filter(record => record.vehicleId === vehicleId);
  }

  async createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const id = this.currentMaintenanceId++;
    const newRecord: MaintenanceRecord = { ...record, id, completedAt: new Date() };
    this.maintenanceRecords.set(id, newRecord);
    return newRecord;
  }

  async updateMaintenanceRecord(id: number, record: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined> {
    const existing = this.maintenanceRecords.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...record };
    this.maintenanceRecords.set(id, updated);
    return updated;
  }

  async deleteMaintenanceRecord(id: number): Promise<boolean> {
    return this.maintenanceRecords.delete(id);
  }

  // Part usage methods
  async getPartUsage(maintenanceId: number): Promise<(PartUsage & { part: Part })[]> {
    return Array.from(this.partUsage.values())
      .filter(usage => usage.maintenanceId === maintenanceId)
      .map(usage => ({
        ...usage,
        part: this.parts.get(usage.partId)!
      }));
  }

  async createPartUsage(usage: InsertPartUsage): Promise<PartUsage> {
    const id = this.currentPartUsageId++;
    const newUsage: PartUsage = { ...usage, id };
    this.partUsage.set(id, newUsage);
    return newUsage;
  }

  // Alert methods
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values());
  }

  async getAlertsByVehicle(vehicleId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(alert => alert.vehicleId === vehicleId);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const newAlert: Alert = { ...alert, id, createdAt: new Date() };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async markAlertAsRead(id: number): Promise<boolean> {
    const alert = this.alerts.get(id);
    if (!alert) return false;

    this.alerts.set(id, { ...alert, isRead: true });
    return true;
  }

  async deleteAlert(id: number): Promise<boolean> {
    return this.alerts.delete(id);
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
    const vehicles = Array.from(this.vehicles.values());
    const parts = Array.from(this.parts.values());
    const alerts = Array.from(this.alerts.values());

    return {
      totalVehicles: vehicles.length,
      operational: vehicles.filter(v => v.status === "operational").length,
      maintenanceDue: vehicles.filter(v => v.status === "maintenance_due").length,
      inRepair: vehicles.filter(v => v.status === "in_repair").length,
      totalParts: parts.length,
      partsInStock: parts.filter(p => p.stock > p.minStock).length,
      partsLowStock: parts.filter(p => p.stock > 0 && p.stock <= p.minStock).length,
      partsOutOfStock: parts.filter(p => p.stock === 0).length,
      unreadAlerts: alerts.filter(a => !a.isRead).length,
    };
  }
}

export const storage = new MemStorage();

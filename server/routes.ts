import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, insertPartSchema, insertMaintenanceRecordSchema, insertAlertSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicleWithAlerts(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ message: "Invalid vehicle data" });
    }
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicleData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(id, vehicleData);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ message: "Invalid vehicle data" });
    }
  });

  app.patch("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicleData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(id, vehicleData);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ message: "Invalid vehicle data" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVehicle(id);
      if (!success) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // Parts routes
  app.get("/api/parts", async (req, res) => {
    try {
      const parts = await storage.getPartsWithStatus();
      res.json(parts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parts" });
    }
  });

  app.post("/api/parts", async (req, res) => {
    try {
      const partData = insertPartSchema.parse(req.body);
      const part = await storage.createPart(partData);
      res.status(201).json(part);
    } catch (error) {
      res.status(400).json({ message: "Invalid part data" });
    }
  });

  app.put("/api/parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const partData = insertPartSchema.partial().parse(req.body);
      const part = await storage.updatePart(id, partData);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }
      res.json(part);
    } catch (error) {
      res.status(400).json({ message: "Invalid part data" });
    }
  });

  app.patch("/api/parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const partData = insertPartSchema.partial().parse(req.body);
      const part = await storage.updatePart(id, partData);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }
      res.json(part);
    } catch (error) {
      res.status(400).json({ message: "Invalid part data" });
    }
  });

  app.delete("/api/parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePart(id);
      if (!success) {
        return res.status(404).json({ message: "Part not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete part" });
    }
  });

  // Maintenance routes
  app.get("/api/maintenance", async (req, res) => {
    try {
      const records = await storage.getMaintenanceRecordsWithParts();
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance records" });
    }
  });

  app.get("/api/maintenance/vehicle/:vehicleId", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const records = await storage.getMaintenanceRecordsByVehicle(vehicleId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance records" });
    }
  });

  app.post("/api/maintenance", async (req, res) => {
    try {
      console.log("Received maintenance data:", req.body);
      const maintenanceData = insertMaintenanceRecordSchema.parse(req.body);
      console.log("Parsed maintenance data:", maintenanceData);
      const record = await storage.createMaintenanceRecord(maintenanceData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Maintenance creation error:", error);
      res.status(400).json({ message: "Invalid maintenance data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.patch("/api/maintenance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const maintenanceData = insertMaintenanceRecordSchema.partial().parse(req.body);
      const record = await storage.updateMaintenanceRecord(id, maintenanceData);
      if (!record) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(400).json({ message: "Invalid maintenance data" });
    }
  });

  app.delete("/api/maintenance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMaintenanceRecord(id);
      if (!success) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete maintenance record" });
    }
  });

  // Alert routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  app.put("/api/alerts/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markAlertAsRead(id);
      if (!success) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  // Vehicle Status Validation routes
  app.get("/api/vehicles/:id/validate", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const validation = await storage.validateVehicleStatus(vehicleId);
      res.json(validation);
    } catch (error) {
      console.error("Error validating vehicle status:", error);
      res.status(500).json({ error: "Failed to validate vehicle status" });
    }
  });

  app.post("/api/vehicles/:id/validate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = await storage.validateVehicleStatus(id);
      res.json(validation);
    } catch (error) {
      console.error("Error validating vehicle:", error);
      res.status(500).json({ error: "Failed to validate vehicle" });
    }
  });

  app.post("/api/vehicles/validate-all", async (req, res) => {
    try {
      await storage.validateAllVehiclesStatus();
      res.json({ message: "All vehicles validated successfully" });
    } catch (error) {
      console.error("Error validating all vehicles:", error);
      res.status(500).json({ error: "Failed to validate all vehicles" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Chat routes
  app.post("/api/chat/query", async (req, res) => {
    try {
      const { message, action } = req.body;
      
      let response = "Je peux vous aider avec les informations sur vos véhicules, les alertes de maintenance, l'inventaire des pièces ou la programmation d'interventions. Que souhaitez-vous savoir ?";
      
      switch (action) {
        case "vehicle-status":
          const stats = await storage.getDashboardStats();
          response = `Actuellement, vous avez ${stats.operational} véhicules opérationnels, ${stats.maintenanceDue} en maintenance et ${stats.inRepair} en réparation.`;
          break;
          
        case "maintenance-alerts":
          const alerts = await storage.getAlerts();
          const urgentAlerts = alerts.filter(a => !a.isRead).slice(0, 3);
          if (urgentAlerts.length > 0) {
            response = `Vous avez ${alerts.filter(a => !a.isRead).length} alertes de maintenance: ${urgentAlerts.map(a => a.message).join(', ')}.`;
          } else {
            response = "Aucune alerte de maintenance urgente pour le moment.";
          }
          break;
          
        case "parts-inventory":
          const parts = await storage.getPartsWithStatus();
          const lowStock = parts.filter(p => p.status === "low_stock");
          const outOfStock = parts.filter(p => p.status === "out_of_stock");
          response = `Stock actuel: ${parts.filter(p => p.status === "in_stock").length} pièces en stock`;
          if (lowStock.length > 0) response += `, ${lowStock.length} pièces en stock faible`;
          if (outOfStock.length > 0) response += `, ${outOfStock.length} pièces en rupture`;
          response += ".";
          break;
          
        case "schedule-maintenance":
          response = "Pour programmer une maintenance, veuillez me donner l'immatriculation du véhicule et le type d'intervention souhaité.";
          break;
      }
      
      res.json({ response });
    } catch (error) {
      res.status(500).json({ message: "Failed to process chat query" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

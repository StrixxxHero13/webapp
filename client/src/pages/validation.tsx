import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  Search, 
  Calendar,
  Gauge,
  RefreshCw,
  Eye,
  Activity,
  TrendingUp,
  Clock
} from "lucide-react";
import type { Vehicle, Alert, MaintenanceRecord } from "@shared/schema";

interface ValidationResult {
  status: "operational" | "maintenance_due" | "in_repair";
  reasons: string[];
  lastInspection?: Date;
  nextMaintenanceDue?: Date;
  urgentIssues: string[];
}

interface VehicleValidation extends Vehicle {
  validation?: ValidationResult;
  lastMaintenance?: MaintenanceRecord;
  alertCount: number;
}

export default function Validation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleValidation | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const { data: maintenanceRecords } = useQuery<MaintenanceRecord[]>({
    queryKey: ["/api/maintenance"],
  });

  // Validate individual vehicle
  const validateVehicle = useMutation({
    mutationFn: async (vehicleId: number) => {
      return apiRequest("POST", `/api/vehicles/${vehicleId}/validate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Validation terminée",
        description: "Le statut du véhicule a été mis à jour.",
      });
    },
  });

  // Validate all vehicles
  const validateAllVehicles = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/vehicles/validate-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Validation globale terminée",
        description: "Tous les statuts de véhicules ont été mis à jour.",
      });
    },
  });

  // Combine vehicle data with validation info
  const vehicleValidations: VehicleValidation[] = (vehicles || []).map(vehicle => {
    const vehicleAlerts = (alerts || []).filter(alert => alert.vehicleId === vehicle.id);
    const lastMaintenance = (maintenanceRecords || [])
      .filter(record => record.vehicleId === vehicle.id)
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0];
    
    return {
      ...vehicle,
      lastMaintenance,
      alertCount: vehicleAlerts.length,
    };
  });

  // Filter vehicles
  const filteredVehicles = vehicleValidations.filter(vehicle => {
    const matchesSearch = vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: vehicleValidations.length,
    operational: vehicleValidations.filter(v => v.status === "operational").length,
    maintenanceDue: vehicleValidations.filter(v => v.status === "maintenance_due").length,
    inRepair: vehicleValidations.filter(v => v.status === "in_repair").length,
    withAlerts: vehicleValidations.filter(v => v.alertCount > 0).length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-green-600 bg-green-50 border-green-200";
      case "maintenance_due": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "in_repair": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return <CheckCircle className="h-4 w-4" />;
      case "maintenance_due": return <AlertTriangle className="h-4 w-4" />;
      case "in_repair": return <Wrench className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "operational": return "Opérationnel";
      case "maintenance_due": return "Maintenance due";
      case "in_repair": return "En réparation";
      default: return "Inconnu";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Validation des véhicules</h3>
          <p className="text-sm text-gray-600">
            Vérifiez et validez le statut opérationnel de tous vos véhicules
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => validateAllVehicles.mutate()}
            disabled={validateAllVehicles.isPending}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${validateAllVehicles.isPending ? 'animate-spin' : ''}`} />
            <span>{validateAllVehicles.isPending ? "Validation..." : "Valider tous"}</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Opérationnels</p>
                <p className="text-2xl font-bold text-green-600">{stats.operational}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.maintenanceDue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Wrench className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">En réparation</p>
                <p className="text-2xl font-bold text-red-600">{stats.inRepair}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avec alertes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.withAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par plaque, marque ou modèle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="operational">Opérationnel</SelectItem>
                  <SelectItem value="maintenance_due">Maintenance due</SelectItem>
                  <SelectItem value="in_repair">En réparation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{vehicle.plate}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </p>
                </div>
                <Badge className={`${getStatusColor(vehicle.status)} border`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(vehicle.status)}
                    <span>{getStatusLabel(vehicle.status)}</span>
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Gauge className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Kilométrage:</span>
                  <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Alertes:</span>
                  <span className={`font-medium ${vehicle.alertCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {vehicle.alertCount}
                  </span>
                </div>
              </div>

              {/* Last Maintenance */}
              {vehicle.lastMaintenance && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Dernière maintenance</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {vehicle.lastMaintenance.type} - {vehicle.lastMaintenance.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {vehicle.lastMaintenance.completedAt 
                      ? new Date(vehicle.lastMaintenance.completedAt).toLocaleDateString('fr-FR')
                      : 'Date inconnue'
                    }
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => validateVehicle.mutate(vehicle.id)}
                  disabled={validateVehicle.isPending}
                  className="flex-1"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${validateVehicle.isPending ? 'animate-spin' : ''}`} />
                  Valider
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVehicle(vehicle)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Détails
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVehicles.length === 0 && !vehiclesLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun véhicule trouvé</h3>
            <p className="text-gray-600">
              Ajustez vos filtres de recherche pour voir plus de résultats.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Validation Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>À propos de la validation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Critères - Opérationnel</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Maintenance à jour</li>
                <li>• Aucune alerte urgente</li>
                <li>• Contrôle technique valide</li>
                <li>• Kilométrage acceptable</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-600">Critères - Maintenance due</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Vidange en retard (+6 mois)</li>
                <li>• Révision annuelle due</li>
                <li>• Kilométrage élevé (+200k km)</li>
                <li>• Alertes de maintenance</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Critères - En réparation</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Réparation récente en cours</li>
                <li>• Panne signalée</li>
                <li>• Immobilisation technique</li>
                <li>• Contrôle technique échoué</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
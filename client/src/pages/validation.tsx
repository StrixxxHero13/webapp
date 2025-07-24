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
  const [statusFilter, setStatusFilter] = useState<string>("needs-validation");
  const [showAllVehicles, setShowAllVehicles] = useState(false);
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
      const result = await apiRequest("POST", `/api/vehicles/${vehicleId}/validate`);
      return { vehicleId, result };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      const vehicle = vehicles?.find(v => v.id === data.vehicleId);
      const result = data.result as unknown as ValidationResult;
      const statusText = result.status === 'operational' ? 'opérationnel' : 
                        result.status === 'maintenance_due' ? 'maintenance requise' : 'en réparation';
      
      toast({
        title: "Validation terminée",
        description: `${vehicle?.plate} est maintenant: ${statusText}. ${result.reasons?.[0] || ''}`,
      });
    },
    onError: () => {
      toast({
        title: "Erreur de validation",
        description: "Impossible de valider le véhicule. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  // Validate all vehicles
  const validateAllVehicles = useMutation({
    mutationFn: async () => {
      const beforeStats = stats;
      const result = await apiRequest("POST", "/api/vehicles/validate-all");
      return { beforeStats, result };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      setTimeout(() => {
        // Show updated stats after a brief delay to let queries refresh
        toast({
          title: "Validation globale terminée",
          description: `${vehicleValidations.length} véhicules ont été analysés et leurs statuts mis à jour.`,
        });
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Erreur de validation",
        description: "Impossible de valider tous les véhicules. Veuillez réessayer.",
        variant: "destructive",
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

  // Filter vehicles - by default only show vehicles that need validation
  const filteredVehicles = vehicleValidations.filter(vehicle => {
    const matchesSearch = vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    
    if (statusFilter === "needs-validation") {
      // Only show vehicles that need attention (not operational)
      matchesStatus = vehicle.status !== "operational";
    } else if (statusFilter === "all") {
      matchesStatus = true;
    } else {
      matchesStatus = vehicle.status === statusFilter;
    }
    
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
            {statusFilter === "needs-validation" 
              ? `${filteredVehicles.length} véhicule(s) nécessitent une validation`
              : "Vérifiez et validez le statut opérationnel de tous vos véhicules"
            }
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setStatusFilter(statusFilter === "needs-validation" ? "all" : "needs-validation")}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>{statusFilter === "needs-validation" ? "Voir tous" : "À valider seulement"}</span>
          </Button>
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
                  <SelectItem value="needs-validation">À valider</SelectItem>
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
                  variant={vehicle.status === 'operational' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => validateVehicle.mutate(vehicle.id)}
                  disabled={validateVehicle.isPending}
                  className="flex-1"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${validateVehicle.isPending ? 'animate-spin' : ''}`} />
                  {vehicle.status === 'operational' ? 'Re-valider' : 'Valider'}
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
            {statusFilter === "needs-validation" ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Excellent travail !</h3>
                <p className="text-gray-600 mb-4">
                  Tous les véhicules sont validés et opérationnels.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setStatusFilter("all")}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Voir tous les véhicules</span>
                </Button>
              </>
            ) : (
              <>
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun véhicule trouvé</h3>
                <p className="text-gray-600">
                  Ajustez vos filtres de recherche pour voir plus de résultats.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* How Validation Works */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <TrendingUp className="h-5 w-5" />
            <span>Comment fonctionne la validation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">La validation analyse automatiquement :</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">Historique de maintenance (vidanges, révisions)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">Alertes non lues et leur priorité</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Gauge className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">Kilométrage et seuils de maintenance</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">Dates de contrôle technique</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wrench className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">Réparations récentes en cours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">État général du véhicule</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-800">Opérationnel</h4>
              </div>
              <p className="text-green-700 text-xs">Le véhicule peut circuler sans restrictions</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium text-yellow-800">Maintenance due</h4>
              </div>
              <p className="text-yellow-700 text-xs">Maintenance nécessaire mais véhicule utilisable</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <Wrench className="h-4 w-4 text-red-600" />
                <h4 className="font-medium text-red-800">En réparation</h4>
              </div>
              <p className="text-red-700 text-xs">Véhicule immobilisé, réparation en cours</p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <p className="text-amber-800 text-sm">
              <strong>Important:</strong> La validation met à jour le statut selon l'état réel du véhicule. 
              Un véhicule peut rester en "maintenance due" s'il a vraiment besoin d'intervention.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
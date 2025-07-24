import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VehicleForm } from "@/components/forms/vehicle-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Car, Truck, Plus, Edit, Trash2, MoreVertical, Eye, Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Vehicle, MaintenanceWithParts, Alert } from "@shared/schema";

export default function Vehicles() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: maintenanceRecords } = useQuery<MaintenanceWithParts[]>({
    queryKey: ["/api/maintenance"],
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Véhicule supprimé",
        description: "Le véhicule a été supprimé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le véhicule.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="p-6">Chargement des véhicules...</div>;
  }

  const getVehicleIcon = (type: string) => {
    return type === "utilitaire" || type === "camion" ? Truck : Car;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <Badge className="bg-success/10 text-success hover:bg-success/20">
            <div className="w-1.5 h-1.5 bg-success rounded-full mr-1" />
            Opérationnel
          </Badge>
        );
      case "maintenance_due":
        return (
          <Badge className="bg-warning/10 text-warning hover:bg-warning/20">
            <div className="w-1.5 h-1.5 bg-warning rounded-full mr-1" />
            Maintenance due
          </Badge>
        );
      case "in_repair":
        return (
          <Badge className="bg-danger/10 text-danger hover:bg-danger/20">
            <div className="w-1.5 h-1.5 bg-danger rounded-full mr-1" />
            En réparation
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestion des véhicules</h3>
          <p className="text-sm text-gray-600">Gérez votre flotte de véhicules</p>
        </div>
        <VehicleForm />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="operational">Opérationnel</SelectItem>
                  <SelectItem value="maintenance_due">Maintenance due</SelectItem>
                  <SelectItem value="in_repair">En réparation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="utilitaire">Utilitaire</SelectItem>
                  <SelectItem value="camion">Camion</SelectItem>
                  <SelectItem value="voiture">Voiture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les marques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les marques</SelectItem>
                  <SelectItem value="renault">Renault</SelectItem>
                  <SelectItem value="peugeot">Peugeot</SelectItem>
                  <SelectItem value="ford">Ford</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles?.map((vehicle) => {
          const IconComponent = getVehicleIcon(vehicle.type);
          
          return (
            <Card key={vehicle.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{vehicle.plate}</h4>
                      <p className="text-sm text-gray-500">{vehicle.make} {vehicle.model}</p>
                    </div>
                  </div>
                  {getStatusBadge(vehicle.status)}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kilométrage:</span>
                    <span className="font-medium text-gray-900">
                      {vehicle.mileage.toLocaleString('fr-FR')} km
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mise en circulation:</span>
                    <span className="font-medium text-gray-900">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900 capitalize">{vehicle.type}</span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="flex-1"
                        onClick={() => setSelectedVehicle(vehicle)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Détails du véhicule - {vehicle.plate}</DialogTitle>
                      </DialogHeader>
                      {selectedVehicle && (
                        <VehicleDetailsModal 
                          vehicle={selectedVehicle} 
                          maintenanceRecords={maintenanceRecords}
                          alerts={alerts}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                  <VehicleForm vehicle={vehicle} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => deleteMutation.mutate(vehicle.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {vehicles?.length === 0 && (
        <div className="text-center py-12">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun véhicule</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter votre premier véhicule à la flotte.
          </p>
          <div className="mt-6">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un véhicule
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface VehicleDetailsModalProps {
  vehicle: Vehicle;
  maintenanceRecords?: MaintenanceWithParts[];
  alerts?: Alert[];
}

function VehicleDetailsModal({ vehicle, maintenanceRecords, alerts }: VehicleDetailsModalProps) {
  const vehicleMaintenanceRecords = maintenanceRecords?.filter(record => record.vehicleId === vehicle.id) || [];
  const vehicleAlerts = alerts?.filter(alert => alert.vehicleId === vehicle.id) || [];
  const recentMaintenances = vehicleMaintenanceRecords.slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "maintenance_due":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "in_repair":
        return <Wrench className="h-5 w-5 text-red-600" />;
      default:
        return <Car className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "operational":
        return "Opérationnel";
      case "maintenance_due":
        return "Maintenance due";
      case "in_repair":
        return "En réparation";
      default:
        return status;
    }
  };

  const totalMaintenanceCost = vehicleMaintenanceRecords.reduce((sum, record) => sum + record.cost, 0);
  const averageMaintenanceCost = vehicleMaintenanceRecords.length > 0 ? totalMaintenanceCost / vehicleMaintenanceRecords.length : 0;

  return (
    <div className="space-y-6">
      {/* Vehicle Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Informations générales</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Immatriculation</h4>
                <p className="text-sm text-gray-600">{vehicle.plate}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Statut</h4>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(vehicle.status)}
                  <span className="text-sm text-gray-600">{getStatusText(vehicle.status)}</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Marque</h4>
                <p className="text-sm text-gray-600">{vehicle.make}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Modèle</h4>
                <p className="text-sm text-gray-600">{vehicle.model}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Année</h4>
                <p className="text-sm text-gray-600">{vehicle.year}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Type</h4>
                <p className="text-sm text-gray-600 capitalize">{vehicle.type}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Kilométrage</h4>
                <p className="text-sm text-gray-600">{vehicle.mileage.toLocaleString()} km</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Date d'ajout</h4>
                <p className="text-sm text-gray-600">
                  {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }) : 'Non disponible'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5" />
              <span>Statistiques de maintenance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Interventions totales</h4>
                <p className="text-2xl font-bold text-primary">{vehicleMaintenanceRecords.length}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Alertes actives</h4>
                <p className="text-2xl font-bold text-yellow-600">{vehicleAlerts.filter(a => !a.isRead).length}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Coût total</h4>
                <p className="text-2xl font-bold text-green-600">{(totalMaintenanceCost / 100).toFixed(0)}€</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Coût moyen</h4>
                <p className="text-2xl font-bold text-blue-600">{(averageMaintenanceCost / 100).toFixed(0)}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {vehicleAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Alertes actives</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vehicleAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.priority === 'urgent' ? 'bg-red-50 border-red-200' :
                    alert.priority === 'high' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : 'Date inconnue'}
                      </p>
                    </div>
                    <Badge 
                      variant={alert.priority === 'urgent' ? 'destructive' : 
                             alert.priority === 'high' ? 'secondary' : 'default'}
                    >
                      {alert.priority === 'urgent' ? 'Urgent' :
                       alert.priority === 'high' ? 'Important' : 'Normal'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Maintenance History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5" />
            <span>Historique des maintenances récentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentMaintenances.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune maintenance</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucune intervention n'a encore été effectuée sur ce véhicule.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMaintenances.map((record) => (
                <div key={record.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {record.type === 'vidange' ? 'Vidange' :
                         record.type === 'controle_technique' ? 'Contrôle technique' :
                         record.type === 'revision' ? 'Révision' : record.type}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                        <span>Coût: {(record.cost / 100).toFixed(2)}€</span>
                        <span>Durée: {Math.floor(record.duration / 60)}h{String(record.duration % 60).padStart(2, '0')}</span>
                        <span>Technicien: {record.technician}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {record.completedAt ? new Date(record.completedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : 'Date inconnue'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {vehicleMaintenanceRecords.length > 5 && (
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    et {vehicleMaintenanceRecords.length - 5} autres interventions...
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

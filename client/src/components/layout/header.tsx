import { useState } from "react";
import { Search, Bell, X, Car, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Vehicle, Alert } from "@shared/schema";

const pageTitles = {
  "/": "Tableau de bord",
  "/vehicles": "Gestion des véhicules", 
  "/maintenance": "Planning de maintenance",
  "/parts": "Inventaire des pièces détachées",
  "/history": "Historique des interventions",
  "/validation": "Validation des véhicules",
  "/chat": "Assistant FleetManager",
};

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: stats } = useQuery<{
    totalVehicles: number;
    operational: number;
    maintenanceDue: number;
    inRepair: number;
    totalParts: number;
    partsInStock: number;
    partsLowStock: number;
    partsOutOfStock: number;
    unreadAlerts: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const markAlertAsRead = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/alerts/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });



  const currentTitle = pageTitles[location as keyof typeof pageTitles] || "FleetManager";

  // Search filter
  const filteredVehicles = vehicles?.filter(vehicle =>
    vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const unreadAlerts = alerts?.filter(alert => !alert.isRead) || [];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-900">{currentTitle}</h2>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute inset-y-0 left-0 ml-3 h-4 w-4 text-gray-400 top-1/2 transform -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Rechercher véhicules par plaque, marque, modèle..."
                  className="w-80 pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </PopoverTrigger>
            {searchQuery && (
              <PopoverContent className="w-96 p-0" align="start">
                <div className="max-h-80 overflow-y-auto">
                  {/* Search Header */}
                  <div className="p-3 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          Résultats de recherche ({filteredVehicles.length})
                        </span>
                      </div>
                      {filteredVehicles.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigate('/vehicles');
                            setSearchQuery("");
                          }}
                          className="text-xs h-6 px-2"
                        >
                          Voir tous
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Search Results */}
                  {filteredVehicles.length > 0 ? (
                    <div>
                      {filteredVehicles.slice(0, 6).map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                          onClick={() => {
                            navigate('/vehicles');
                            setSearchQuery("");
                          }}
                        >
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Car className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{vehicle.plate}</p>
                                <p className="text-xs text-gray-500">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                              </div>
                              <Badge 
                                variant={vehicle.status === 'operational' ? 'default' : 
                                       vehicle.status === 'maintenance_due' ? 'secondary' : 'destructive'}
                                className="text-xs"
                              >
                                {vehicle.status === 'operational' ? 'Opérationnel' :
                                 vehicle.status === 'maintenance_due' ? 'Maintenance due' : 'En réparation'}
                              </Badge>
                            </div>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <span>Kilométrage: {vehicle.mileage.toLocaleString()} km</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredVehicles.length > 6 && (
                        <div 
                          className="p-3 text-center text-sm text-gray-600 border-t bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => {
                            navigate('/vehicles');
                            setSearchQuery("");
                          }}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span>Voir {filteredVehicles.length - 6} autres véhicules</span>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Aucun véhicule trouvé</p>
                      <p className="text-xs text-gray-500">
                        Essayez de rechercher par plaque d'immatriculation, marque ou modèle
                      </p>
                    </div>
                  )}

                  {/* Search Actions */}
                  <div className="p-3 bg-gray-50 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigate('/vehicles');
                          setSearchQuery("");
                        }}
                        className="text-xs"
                      >
                        <Car className="h-3 w-3 mr-1" />
                        Tous les véhicules
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigate('/maintenance');
                          setSearchQuery("");
                        }}
                        className="text-xs"
                      >
                        <Search className="h-3 w-3 mr-1" />
                        Maintenance
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            )}
          </Popover>
          
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadAlerts.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadAlerts.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <div className="bg-white rounded-lg shadow-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">{unreadAlerts.length} nouvelle(s) alerte(s)</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {unreadAlerts.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune notification</h3>
                      <p className="mt-1 text-sm text-gray-500">Toutes vos alertes sont à jour!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {unreadAlerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mt-1 ${
                              alert.priority === 'urgent' ? 'bg-red-100' :
                              alert.priority === 'high' ? 'bg-orange-100' : 'bg-blue-100'
                            }`}>
                              <Bell className={`h-4 w-4 ${
                                alert.priority === 'urgent' ? 'text-red-600' :
                                alert.priority === 'high' ? 'text-orange-600' : 'text-blue-600'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'Date inconnue'}
                              </p>
                              <Badge 
                                variant={alert.priority === 'urgent' ? 'destructive' : 
                                       alert.priority === 'high' ? 'secondary' : 'default'}
                                className="text-xs mt-2"
                              >
                                {alert.priority === 'urgent' ? 'Urgent' :
                                 alert.priority === 'high' ? 'Important' : 'Normal'}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAlertAsRead.mutate(alert.id)}
                              disabled={markAlertAsRead.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {unreadAlerts.length > 5 && (
                        <div className="p-3 text-center text-sm text-gray-500 border-t">
                          et {unreadAlerts.length - 5} autres alertes...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          

        </div>
      </div>
    </header>
  );
}

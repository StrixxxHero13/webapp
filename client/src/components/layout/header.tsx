import { useState } from "react";
import { Search, Bell, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { Vehicle, Alert } from "@shared/schema";

const pageTitles = {
  "/": "Tableau de bord",
  "/vehicles": "Gestion des véhicules", 
  "/maintenance": "Planning de maintenance",
  "/parts": "Inventaire des pièces détachées",
  "/history": "Historique des interventions",
  "/chat": "Assistant FleetManager",
};

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: stats } = useQuery({
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
                  placeholder="Rechercher un véhicule..."
                  className="w-64 pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </PopoverTrigger>
            {searchQuery && filteredVehicles.length > 0 && (
              <PopoverContent className="w-80 p-0" align="start">
                <div className="max-h-60 overflow-y-auto">
                  {filteredVehicles.slice(0, 5).map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => setSearchQuery("")}
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{vehicle.plate.slice(0, 2)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{vehicle.plate}</p>
                        <p className="text-xs text-gray-500">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                        <Badge 
                          variant={vehicle.status === 'operational' ? 'default' : 
                                 vehicle.status === 'maintenance_due' ? 'secondary' : 'destructive'}
                          className="text-xs mt-1"
                        >
                          {vehicle.status === 'operational' ? 'Opérationnel' :
                           vehicle.status === 'maintenance_due' ? 'Maintenance due' : 'En réparation'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {filteredVehicles.length > 5 && (
                    <div className="p-3 text-center text-sm text-gray-500 border-t">
                      et {filteredVehicles.length - 5} autres véhicules...
                    </div>
                  )}
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
                                {new Date(alert.createdAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
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
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="text-white text-sm" />
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-900">Pierre Martin</div>
              <div className="text-xs text-gray-500">Gestionnaire de flotte</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

import { Search, Bell, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

const pageTitles = {
  "/": "Tableau de bord",
  "/vehicles": "Gestion des véhicules", 
  "/maintenance": "Planning de maintenance",
  "/parts": "Inventaire des pièces détachées",
  "/history": "Historique des interventions",
  "/chat": "Assistant FleetManager",
};

export default function Header() {
  const [location] = useLocation();
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const currentTitle = pageTitles[location as keyof typeof pageTitles] || "FleetManager";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-900">{currentTitle}</h2>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute inset-y-0 left-0 ml-3 h-4 w-4 text-gray-400 top-1/2 transform -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Rechercher un véhicule..."
              className="w-64 pl-10"
            />
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {stats?.unreadAlerts && stats.unreadAlerts > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {stats.unreadAlerts}
                </Badge>
              )}
            </Button>
          </div>
          
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

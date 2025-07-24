import { Link, useLocation } from "wouter";
import { Truck, BarChart3, Car, Wrench, Cog, History, Shield, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Tableau de bord", href: "/", icon: BarChart3 },
  { name: "Véhicules", href: "/vehicles", icon: Car },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Pièces détachées", href: "/parts", icon: Cog },
  { name: "Historique", href: "/history", icon: History },
  { name: "Validation", href: "/validation", icon: Shield },
  { name: "Assistant Chat", href: "/chat", icon: MessageCircle },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Truck className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FleetManager</h1>
            <p className="text-sm text-gray-500">Pro</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

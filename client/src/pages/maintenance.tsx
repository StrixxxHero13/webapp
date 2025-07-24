import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaintenanceForm } from "@/components/forms/maintenance-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Wrench, AlertTriangle, Cog, CheckCircle, Calendar, Trash2, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { MaintenanceWithParts, Alert } from "@shared/schema";

export default function Maintenance() {
  const { data: maintenanceRecords, isLoading } = useQuery<MaintenanceWithParts[]>({
    queryKey: ["/api/maintenance"],
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const scheduleMaintenance = useMutation({
    mutationFn: async (alertId: number) => {
      await apiRequest("PUT", `/api/alerts/${alertId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Maintenance programmée",
        description: "La maintenance a été ajoutée au planning.",
      });
    },
  });

  if (isLoading) {
    return <div className="p-6">Chargement des données de maintenance...</div>;
  }

  // Filter for upcoming maintenance based on alerts
  const upcomingMaintenance = alerts?.filter(alert => 
    alert.type === "maintenance_due" && !alert.isRead
  ).slice(0, 5) || [];

  const maintenanceTypes = [
    { type: "vidange", count: maintenanceRecords?.filter(r => r.type === "vidange").length || 0, icon: "🛢️" },
    { type: "controle_technique", count: maintenanceRecords?.filter(r => r.type === "controle_technique").length || 0, icon: "📋" },
    { type: "revision", count: maintenanceRecords?.filter(r => r.type === "revision").length || 0, icon: "🔧" },
  ];

  const getMaintenanceIcon = (type: string) => {
    switch (type) {
      case "maintenance_due":
        return <Wrench className="text-warning h-4 w-4" />;
      case "overdue":
        return <AlertTriangle className="text-danger h-4 w-4" />;
      default:
        return <Calendar className="text-primary h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-danger/10 text-danger">En retard</Badge>;
      case "high":
        return <Badge className="bg-warning/10 text-warning">Urgent</Badge>;
      case "medium":
        return <Badge className="bg-warning/10 text-warning">Dans 7 jours</Badge>;
      default:
        return <Badge className="bg-primary/10 text-primary">Dans 20 jours</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Planning de maintenance</h3>
          <p className="text-sm text-gray-600">Planifiez et suivez les maintenances</p>
        </div>
        <MaintenanceForm />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Maintenance */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Maintenances à venir</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingMaintenance.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-success" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Aucune maintenance urgente
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Toutes les maintenances sont à jour !
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMaintenance.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          alert.priority === 'urgent' ? 'bg-danger/10' : 'bg-warning/10'
                        }`}>
                          {getMaintenanceIcon(alert.type)}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Véhicule</h5>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                          <p className="text-xs text-gray-500">
                            {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getPriorityBadge(alert.priority)}
                        <div className="mt-2">
                          <Button 
                            size="sm" 
                            variant={alert.priority === 'urgent' ? 'destructive' : 'default'}
                            onClick={() => scheduleMaintenance.mutate(alert.id)}
                            disabled={scheduleMaintenance.isPending}
                          >
                            {alert.priority === 'urgent' ? 'Urgent' : 'Planifier'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Maintenance Types */}
          <Card>
            <CardHeader>
              <CardTitle>Types de maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {maintenanceTypes.map((type) => (
                  <div
                    key={type.type}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {type.type === 'vidange' ? 'Vidange' :
                         type.type === 'controle_technique' ? 'Contrôle technique' :
                         type.type === 'revision' ? 'Révision' : type.type}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {type.count} effectuées
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Maintenances ce mois:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {maintenanceRecords?.filter(record => {
                      const recordDate = record.completedAt ? new Date(record.completedAt) : new Date();
                      const currentDate = new Date();
                      return recordDate.getMonth() === currentDate.getMonth() &&
                             recordDate.getFullYear() === currentDate.getFullYear();
                    }).length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Coût moyen:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {maintenanceRecords && maintenanceRecords.length > 0
                      ? (maintenanceRecords.reduce((sum, r) => sum + r.cost, 0) / maintenanceRecords.length / 100).toFixed(0)
                      : 0}€
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Temps moyen:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {maintenanceRecords && maintenanceRecords.length > 0
                      ? (maintenanceRecords.reduce((sum, r) => sum + r.duration, 0) / maintenanceRecords.length / 60).toFixed(1)
                      : 0}h
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

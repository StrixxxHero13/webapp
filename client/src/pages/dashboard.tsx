import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  CheckCircle, 
  AlertTriangle, 
  Wrench,
  ArrowRight,
  Clock,
  CheckCircle2,
  Plus,
  MoreVertical
} from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  totalVehicles: number;
  operational: number;
  maintenanceDue: number;
  inRepair: number;
  totalParts: number;
  partsInStock: number;
  partsLowStock: number;
  partsOutOfStock: number;
  unreadAlerts: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery<any[]>({
    queryKey: ["/api/alerts"],
  });

  const { data: maintenanceRecords, isLoading: maintenanceLoading } = useQuery<any[]>({
    queryKey: ["/api/maintenance"],
  });

  if (statsLoading) {
    return <div className="p-6">Chargement...</div>;
  }

  const recentAlerts = alerts?.filter(alert => !alert.isRead).slice(0, 3) || [];
  const recentActivity = maintenanceRecords?.slice(0, 3) || [];
  const featuredVehicles = vehicles?.slice(0, 3) || [];

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Car className="text-primary h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Véhicules</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.totalVehicles || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-success h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Opérationnels</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.operational || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-warning h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Maintenance Due</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.maintenanceDue || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center">
                  <Wrench className="text-danger h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Réparation</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.inRepair || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alertes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div>Chargement des alertes...</div>
            ) : recentAlerts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Aucune alerte récente
              </div>
            ) : (
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 ${
                      alert.priority === 'urgent' ? 'bg-danger' : 
                      alert.priority === 'high' ? 'bg-warning' : 'bg-primary'
                    } rounded-full mt-2`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Véhicule concerné
                      </p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            {maintenanceLoading ? (
              <div>Chargement de l'activité...</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Aucune activité récente
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((record) => (
                  <div key={record.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="text-success h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {record.type === 'vidange' ? 'Vidange effectuée' :
                         record.type === 'reparation' ? 'Réparation terminée' :
                         record.type === 'controle_technique' ? 'Contrôle technique' :
                         record.type === 'revision' ? 'Révision terminée' : record.type}
                      </p>
                      <p className="text-sm text-gray-600">{record.description}</p>
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                        <span>Coût: {(record.cost / 100).toFixed(2)}€</span>
                        <span>Durée: {Math.floor(record.duration / 60)}h{String(record.duration % 60).padStart(2, '0')}</span>
                        <span>Par: {record.technician}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(record.completedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vue d'ensemble des véhicules</CardTitle>
            <Link href="/vehicles">
              <Button variant="outline" size="sm">
                Voir tout <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {vehiclesLoading ? (
            <div>Chargement des véhicules...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Véhicule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kilométrage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Année
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {featuredVehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Car className="text-gray-500 h-5 w-5" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.plate}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vehicle.make} {vehicle.model}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            vehicle.status === "operational" ? "default" :
                            vehicle.status === "maintenance_due" ? "secondary" :
                            "destructive"
                          }
                          className={
                            vehicle.status === "operational" ? "bg-success/10 text-success hover:bg-success/20" :
                            vehicle.status === "maintenance_due" ? "bg-warning/10 text-warning hover:bg-warning/20" :
                            "bg-danger/10 text-danger hover:bg-danger/20"
                          }
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                            vehicle.status === "operational" ? "bg-success" :
                            vehicle.status === "maintenance_due" ? "bg-warning" :
                            "bg-danger"
                          }`} />
                          {vehicle.status === "operational" ? "Opérationnel" :
                           vehicle.status === "maintenance_due" ? "Maintenance due" :
                           "En réparation"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vehicle.mileage.toLocaleString('fr-FR')} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vehicle.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

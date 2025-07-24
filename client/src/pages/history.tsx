import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Wrench, ClipboardCheck, History as HistoryIcon } from "lucide-react";

export default function History() {
  const { data: maintenanceRecords, isLoading } = useQuery({
    queryKey: ["/api/maintenance"],
  });

  const { data: vehicles } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  if (isLoading) {
    return <div className="p-6">Chargement de l'historique...</div>;
  }

  const getMaintenanceIcon = (type: string) => {
    switch (type) {
      case "vidange":
        return <CheckCircle className="text-success h-4 w-4" />;
      case "reparation":
        return <Wrench className="text-warning h-4 w-4" />;
      case "controle_technique":
        return <ClipboardCheck className="text-primary h-4 w-4" />;
      case "revision":
        return <CheckCircle className="text-success h-4 w-4" />;
      default:
        return <CheckCircle className="text-success h-4 w-4" />;
    }
  };

  const getMaintenanceTitle = (type: string) => {
    switch (type) {
      case "vidange":
        return "Vidange effectuée";
      case "reparation":
        return "Réparation terminée";
      case "controle_technique":
        return "Contrôle technique";
      case "revision":
        return "Révision terminée";
      default:
        return type;
    }
  };

  const getVehicleByRecord = (vehicleId: number) => {
    return vehicles?.find(v => v.id === vehicleId);
  };

  // Sort records by completion date (most recent first)
  const sortedRecords = maintenanceRecords?.sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  ) || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Historique des interventions</h3>
        <p className="text-sm text-gray-600">Consultez l'historique complet des maintenances et réparations</p>
      </div>

      {/* History Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les véhicules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les véhicules</SelectItem>
                  {vehicles?.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'intervention</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="vidange">Vidange</SelectItem>
                  <SelectItem value="reparation">Réparation</SelectItem>
                  <SelectItem value="controle_technique">Contrôle technique</SelectItem>
                  <SelectItem value="revision">Révision</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <Input type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <Input type="date" />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Filtrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Historique détaillé</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedRecords.length === 0 ? (
            <div className="text-center py-12">
              <HistoryIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun historique</h3>
              <p className="mt-1 text-sm text-gray-500">
                L'historique des interventions apparaîtra ici une fois les maintenances effectuées.
              </p>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {sortedRecords.map((record, index) => {
                  const vehicle = getVehicleByRecord(record.vehicleId);
                  const isLast = index === sortedRecords.length - 1;
                  
                  return (
                    <li key={record.id}>
                      <div className="relative pb-8">
                        {!isLast && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center ring-8 ring-white">
                              {getMaintenanceIcon(record.type)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {getMaintenanceTitle(record.type)} - {vehicle?.plate || `Véhicule #${record.vehicleId}`}
                              </p>
                              <div className="mt-2 text-sm text-gray-600">
                                <p>• {record.description}</p>
                              </div>
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                <span>Coût: {(record.cost / 100).toFixed(2)}€</span>
                                <span>
                                  Durée: {Math.floor(record.duration / 60)}h{String(record.duration % 60).padStart(2, '0')}
                                </span>
                                <span>Technicien: {record.technician}</span>
                              </div>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time>
                                {new Date(record.completedAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, Wrench, ClipboardCheck, History as HistoryIcon, Eye, RotateCcw } from "lucide-react";
import type { MaintenanceWithParts, Vehicle } from "@shared/schema";

export default function History() {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceWithParts | null>(null);

  const { data: maintenanceRecords, isLoading } = useQuery<MaintenanceWithParts[]>({
    queryKey: ["/api/maintenance"],
  });

  const { data: vehicles } = useQuery<Vehicle[]>({
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

  // Filter and sort records
  const filteredRecords = maintenanceRecords?.filter(record => {
    if (selectedVehicle !== "all" && record.vehicleId !== parseInt(selectedVehicle)) return false;
    if (selectedType !== "all" && record.type !== selectedType) return false;
    if (startDate && new Date(record.completedAt) < new Date(startDate)) return false;
    if (endDate && new Date(record.completedAt) > new Date(endDate)) return false;
    return true;
  }) || [];

  const sortedRecords = filteredRecords.sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  const handleResetFilters = () => {
    setSelectedVehicle("all");
    setSelectedType("all");
    setStartDate("");
    setEndDate("");
  };

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
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
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
              <Select value={selectedType} onValueChange={setSelectedType}>
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
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <Input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end space-x-2">
              <Button className="flex-1">
                Filtrer
              </Button>
              <Button 
                variant="outline" 
                onClick={handleResetFilters}
                className="flex items-center space-x-1"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Réinitialiser</span>
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
                            <div className="text-right text-sm whitespace-nowrap">
                              <time className="text-gray-500 block">
                                {new Date(record.completedAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </time>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="mt-2"
                                    onClick={() => setSelectedRecord(record)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Voir détails
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Détails de l'intervention</DialogTitle>
                                  </DialogHeader>
                                  {selectedRecord && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-medium text-gray-900">Véhicule</h4>
                                          <p className="text-sm text-gray-600">{vehicle?.plate || `Véhicule #${record.vehicleId}`}</p>
                                          <p className="text-xs text-gray-500">{vehicle?.make} {vehicle?.model}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-900">Type d'intervention</h4>
                                          <p className="text-sm text-gray-600">{getMaintenanceTitle(selectedRecord.type)}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-900">Date de réalisation</h4>
                                          <p className="text-sm text-gray-600">
                                            {new Date(selectedRecord.completedAt).toLocaleDateString('fr-FR', {
                                              day: '2-digit',
                                              month: 'long',
                                              year: 'numeric'
                                            })}
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-900">Technicien</h4>
                                          <p className="text-sm text-gray-600">{selectedRecord.technician}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-900">Durée</h4>
                                          <p className="text-sm text-gray-600">
                                            {Math.floor(selectedRecord.duration / 60)}h{String(selectedRecord.duration % 60).padStart(2, '0')}
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-900">Coût total</h4>
                                          <p className="text-sm text-gray-600">{(selectedRecord.cost / 100).toFixed(2)}€</p>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedRecord.description}</p>
                                      </div>
                                      {selectedRecord.partsUsed && selectedRecord.partsUsed.length > 0 && (
                                        <div>
                                          <h4 className="font-medium text-gray-900 mb-2">Pièces utilisées</h4>
                                          <div className="space-y-2">
                                            {selectedRecord.partsUsed.map((partUsage, idx) => (
                                              <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                                <span className="text-sm">{partUsage.part.name}</span>
                                                <span className="text-sm text-gray-600">Qté: {partUsage.quantity}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
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

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertMaintenanceRecordSchema, type InsertMaintenanceRecord, type MaintenanceRecord, type Vehicle } from "@shared/schema";
import { Plus, Edit } from "lucide-react";

interface MaintenanceFormProps {
  maintenance?: MaintenanceRecord;
  onSuccess?: () => void;
}

export function MaintenanceForm({ maintenance, onSuccess }: MaintenanceFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const form = useForm<InsertMaintenanceRecord>({
    resolver: zodResolver(insertMaintenanceRecordSchema),
    defaultValues: maintenance ? {
      vehicleId: maintenance.vehicleId,
      type: maintenance.type,
      description: maintenance.description,
      cost: maintenance.cost,
    } : {
      vehicleId: undefined,
      type: "vidange",
      description: "",
      cost: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertMaintenanceRecord) => {
      if (maintenance) {
        return apiRequest("PATCH", `/api/maintenance/${maintenance.id}`, data);
      } else {
        return apiRequest("POST", "/api/maintenance", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: maintenance ? "Maintenance modifiée" : "Maintenance ajoutée",
        description: maintenance ? "La maintenance a été modifiée avec succès." : "La maintenance a été ajoutée avec succès.",
      });
      setOpen(false);
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de ${maintenance ? "modifier" : "ajouter"} la maintenance.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertMaintenanceRecord) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          {maintenance ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{maintenance ? "Modifier" : "Programmer une maintenance"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{maintenance ? "Modifier la maintenance" : "Programmer une maintenance"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Véhicule</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un véhicule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(vehicles || []).map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          {vehicle.plate} - {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de maintenance</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="vidange">Vidange</SelectItem>
                      <SelectItem value="controle_technique">Contrôle technique</SelectItem>
                      <SelectItem value="revision">Révision générale</SelectItem>
                      <SelectItem value="reparation">Réparation</SelectItem>
                      <SelectItem value="entretien">Entretien</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description de la maintenance..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coût (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={mutation.isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "En cours..." : maintenance ? "Modifier" : "Programmer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
"use client"

import type React from "react"

import { useState } from "react"
import { FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateInvoice } from "@/app/actions/customer-actions"
import { useToast } from "@/hooks/use-toast"
import type { Service } from "@/lib/graphql/types"

interface GenerateInvoiceDialogProps {
  customerId: string
  customerName: string
  services?: Service[]
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function GenerateInvoiceDialog({
  customerId,
  customerName,
  services,
  onSuccess,
  trigger,
}: GenerateInvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedService, setSelectedService] = useState<string>("all")
  const { toast } = useToast()

  const activeServices = services?.filter((s) => s.service_status === "active") || []

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const serviceId = selectedService === "all" ? undefined : selectedService
      const result = await generateInvoice(customerId, serviceId)

      if (result.success) {
        toast({
          title: "Factura generada",
          description: result.message || `Factura ${result.invoice?.increment_id || ""} generada exitosamente`,
        })
        setOpen(false)
        setSelectedService("all")
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo generar la factura",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al generar la factura",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            Generar Factura
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generar Factura
          </DialogTitle>
          <DialogDescription>Generar una nueva factura para {customerName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {activeServices.length > 0 ? (
            <div className="space-y-2">
              <Label>Servicio a facturar</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los servicios activos</SelectItem>
                  {activeServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.plan?.name || "Sin plan"} - {service.service_ip || "Sin IP"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {activeServices.length} servicio(s) activo(s) disponible(s)
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 text-center">
              <p className="text-sm text-warning">Este cliente no tiene servicios activos para facturar</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || activeServices.length === 0} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Generar Factura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

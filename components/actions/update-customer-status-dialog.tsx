"use client"

import type React from "react"

import { useState } from "react"
import { UserCog, Loader2, CheckCircle, XCircle, PauseCircle } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { updateCustomerStatus } from "@/app/actions/customer-actions"
import { useToast } from "@/hooks/use-toast"

interface UpdateCustomerStatusDialogProps {
  customerId: string
  customerName: string
  currentStatus?: string
  onSuccess?: () => void
  trigger?: React.ReactNode
}

const statusOptions = [
  { value: "active", label: "Activo", icon: CheckCircle, color: "text-accent" },
  { value: "inactive", label: "Inactivo", icon: XCircle, color: "text-muted-foreground" },
  { value: "suspended", label: "Suspendido", icon: PauseCircle, color: "text-warning" },
]

export function UpdateCustomerStatusDialog({
  customerId,
  customerName,
  currentStatus = "active",
  onSuccess,
  trigger,
}: UpdateCustomerStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (status === currentStatus) {
      setOpen(false)
      return
    }

    setLoading(true)
    try {
      const result = await updateCustomerStatus(customerId, status)

      if (result.success) {
        toast({
          title: "Estado actualizado",
          description: result.message || "El estado del cliente se ha actualizado exitosamente",
        })
        setOpen(false)
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo actualizar el estado",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el estado",
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
          <Button variant="outline" className="gap-2 bg-transparent">
            <UserCog className="h-4 w-4" />
            Cambiar Estado
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            Cambiar Estado del Cliente
          </DialogTitle>
          <DialogDescription>Actualizar el estado de {customerName}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label className="mb-3 block">Seleccionar nuevo estado</Label>
          <RadioGroup value={status} onValueChange={setStatus} className="space-y-3">
            {statusOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label
                  htmlFor={option.value}
                  className="flex items-center gap-2 cursor-pointer flex-1 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <option.icon className={`h-5 w-5 ${option.color}`} />
                  <span className="font-medium">{option.label}</span>
                  {option.value === currentStatus && (
                    <span className="ml-auto text-xs text-muted-foreground">(actual)</span>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || status === currentStatus} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Actualizar Estado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

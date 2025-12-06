"use client"

import { useState } from "react"
import { Play, Pause, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { activateService, suspendService } from "@/app/actions/service-actions"
import { useToast } from "@/hooks/use-toast"

interface ServiceStatusActionsProps {
  serviceId: string
  currentStatus?: string
  onSuccess?: () => void
}

export function ActivateServiceButton({ serviceId, currentStatus, onSuccess }: ServiceStatusActionsProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleActivate = async () => {
    setLoading(true)
    try {
      const result = await activateService(serviceId)

      if (result.success) {
        toast({
          title: "Servicio activado",
          description: result.message || "El servicio se ha activado exitosamente",
        })
        setOpen(false)
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo activar el servicio",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al activar el servicio",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (currentStatus === "active") {
    return null
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-accent hover:text-accent bg-transparent">
          <Play className="h-4 w-4" />
          Activar Servicio
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Activar Servicio</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas activar este servicio? El cliente podrá utilizar el servicio de internet
            inmediatamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleActivate} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Activar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function SuspendServiceButton({ serviceId, currentStatus, onSuccess }: ServiceStatusActionsProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleSuspend = async () => {
    setLoading(true)
    try {
      const result = await suspendService(serviceId)

      if (result.success) {
        toast({
          title: "Servicio suspendido",
          description: result.message || "El servicio se ha suspendido exitosamente",
        })
        setOpen(false)
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo suspender el servicio",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al suspender el servicio",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (currentStatus === "suspended" || currentStatus === "cancelled") {
    return null
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-warning hover:text-warning bg-transparent">
          <Pause className="h-4 w-4" />
          Suspender Servicio
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suspender Servicio</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas suspender este servicio? El cliente no podrá utilizar el servicio de internet
            hasta que sea reactivado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSuspend}
            disabled={loading}
            className="gap-2 bg-warning hover:bg-warning/90"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Suspender
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

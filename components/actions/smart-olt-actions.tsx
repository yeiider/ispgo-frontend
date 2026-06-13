"use client"

import { useState, useEffect, useCallback } from "react"
import {
  RefreshCw,
  Power,
  PowerOff,
  Trash2,
  Radio,
  RadioTower,
  Loader2,
  Satellite,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  smartOltRebootOnu,
  smartOltEnableOnu,
  smartOltDisableOnu,
  smartOltRemoveEquipment,
  smartOltEnableCatv,
  smartOltDisableCatv,
} from "@/app/actions/smart-olt-actions"
import { graphqlRequest } from "@/lib/graphql/client"

const CATV_STATUS_QUERY = `
  query SmartOltCatvStatus($externalId: String!) {
    smartOltCatvStatus(external_id: $externalId) {
      enabled
      message
    }
  }
`

interface SmartOltCatvStatus {
  smartOltCatvStatus: {
    enabled: boolean
    message?: string
  }
}

interface SmartOltActionsProps {
  serviceId: string
  sn?: string | null
  onActionSuccess?: () => void
}

type ActionType = "reboot" | "enable" | "disable" | "remove" | "enableCatv" | "disableCatv"

export function SmartOltActions({ serviceId, sn, onActionSuccess }: SmartOltActionsProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState<ActionType | null>(null)
  const [confirmAction, setConfirmAction] = useState<ActionType | null>(null)
  const [catvEnabled, setCatvEnabled] = useState<boolean | null>(null)
  const [catvLoading, setCatvLoading] = useState(false)

  const hasSn = !!sn

  const fetchCatvStatus = useCallback(async () => {
    if (!sn) return
    setCatvLoading(true)
    try {
      const data = await graphqlRequest<SmartOltCatvStatus>(CATV_STATUS_QUERY, { externalId: sn })
      setCatvEnabled(data.smartOltCatvStatus.enabled)
    } catch {
      setCatvEnabled(null)
    } finally {
      setCatvLoading(false)
    }
  }, [sn])

  useEffect(() => {
    if (sn) {
      fetchCatvStatus()
    }
  }, [sn, fetchCatvStatus])

  const successHandler = () => {
    onActionSuccess?.()
  }

  const executeAction = async (action: ActionType) => {
    if (!sn) return
    setLoading(action)
    setConfirmAction(null)

    try {
      let result: { success: boolean; message?: string }

      switch (action) {
        case "reboot":
          result = await smartOltRebootOnu(serviceId, sn)
          break
        case "enable":
          result = await smartOltEnableOnu(serviceId, sn)
          break
        case "disable":
          result = await smartOltDisableOnu(serviceId, sn)
          break
        case "remove":
          result = await smartOltRemoveEquipment(serviceId, sn)
          break
        case "enableCatv":
          result = await smartOltEnableCatv(serviceId, sn)
          if (result.success) setCatvEnabled(true)
          break
        case "disableCatv":
          result = await smartOltDisableCatv(serviceId, sn)
          if (result.success) setCatvEnabled(false)
          break
      }

      if (result.success) {
        toast({
          title: "Operación exitosa",
          description: result.message || "La operación se completó correctamente",
        })
        successHandler()
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo completar la operación",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al ejecutar la operación",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  if (!hasSn) {
    return null
  }

  const actionLabels: Record<ActionType, { title: string; description: string; confirmButton: string }> = {
    reboot: {
      title: "Reiniciar ONU",
      description: "¿Estás seguro de que deseas reiniciar la ONU? El servicio se interrumpirá temporalmente.",
      confirmButton: "Reiniciar",
    },
    enable: {
      title: "Habilitar ONU",
      description: "¿Estás seguro de que deseas habilitar la ONU?",
      confirmButton: "Habilitar",
    },
    disable: {
      title: "Deshabilitar ONU",
      description: "¿Estás seguro de que deseas deshabilitar la ONU? El cliente perderá conectividad.",
      confirmButton: "Deshabilitar",
    },
    remove: {
      title: "Retirar Equipo",
      description: "¿Estás seguro de que deseas retirar el equipo? Se eliminará la ONU del SmartOLT y se quitará el SN del servicio.",
      confirmButton: "Retirar",
    },
    enableCatv: {
      title: "Activar CATV",
      description: "¿Estás seguro de que deseas activar el servicio de CATV en esta ONU?",
      confirmButton: "Activar CATV",
    },
    disableCatv: {
      title: "Desactivar CATV",
      description: "¿Estás seguro de que deseas desactivar el servicio de CATV en esta ONU?",
      confirmButton: "Desactivar CATV",
    },
  }

  const ActionButton = ({ action, icon, label, variant = "outline", color }: {
    action: ActionType
    icon: React.ReactNode
    label: string
    variant?: "outline" | "destructive"
    color?: string
  }) => {
    const isCurrentAction = loading === action

    return (
      <AlertDialog
        open={confirmAction === action}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null)
        }}
      >
        <AlertDialogTrigger asChild>
          <Button
            variant={variant}
            size="sm"
            className={`gap-2 bg-transparent ${color || ""}`}
            disabled={loading !== null}
            onClick={() => setConfirmAction(action)}
          >
            {isCurrentAction ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              icon
            )}
            {label}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionLabels[action].title}</AlertDialogTitle>
            <AlertDialogDescription>
              {actionLabels[action].description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCurrentAction}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => executeAction(action)}
              disabled={isCurrentAction}
              className={variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : "gap-2"}
            >
              {isCurrentAction && <Loader2 className="h-4 w-4 animate-spin" />}
              {actionLabels[action].confirmButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RadioTower className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">SmartOLT</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            SN: {sn}
          </Badge>
        </div>
        <CardDescription>Administración del dispositivo ONU/ONT</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Acciones generales */}
          <div className="flex flex-wrap gap-2">
            <ActionButton
              action="reboot"
              icon={<RefreshCw className="h-4 w-4" />}
              label="Reiniciar"
            />
            <ActionButton
              action="enable"
              icon={<Power className="h-4 w-4 text-accent" />}
              label="Habilitar"
              color="text-accent hover:text-accent"
            />
            <ActionButton
              action="disable"
              icon={<PowerOff className="h-4 w-4 text-warning" />}
              label="Deshabilitar"
              color="text-warning hover:text-warning"
            />
            <ActionButton
              action="remove"
              icon={<Trash2 className="h-4 w-4 text-destructive" />}
              label="Retirar Equipo"
              variant="destructive"
            />
          </div>

          {/* CATV */}
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Satellite className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">CATV / TV Cable</span>
              {catvLoading ? (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              ) : catvEnabled === true ? (
                <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 text-xs">
                  Activo
                </Badge>
              ) : catvEnabled === false ? (
                <Badge variant="outline" className="text-muted-foreground text-xs">
                  Inactivo
                </Badge>
              ) : null}
            </div>
            <div className="flex gap-2">
              {!catvLoading && (
                <>
                  {catvEnabled ? (
                    <ActionButton
                      action="disableCatv"
                      icon={<PowerOff className="h-4 w-4" />}
                      label="Desactivar"
                      color="text-warning hover:text-warning"
                    />
                  ) : (
                    <ActionButton
                      action="enableCatv"
                      icon={<Radio className="h-4 w-4" />}
                      label="Activar"
                      color="text-accent hover:text-accent"
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

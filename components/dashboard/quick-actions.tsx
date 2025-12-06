"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, FileText, Scissors, Wrench, CreditCard, MapPin, Wifi, AlertTriangle } from "lucide-react"

const actions = [
  { icon: UserPlus, label: "Nuevo Cliente", color: "text-primary", bg: "bg-primary/10 hover:bg-primary/20" },
  { icon: FileText, label: "Nueva Factura", color: "text-accent", bg: "bg-accent/10 hover:bg-accent/20" },
  { icon: Wifi, label: "Nuevo Servicio", color: "text-chart-4", bg: "bg-chart-4/10 hover:bg-chart-4/20" },
  { icon: Scissors, label: "Programar Corte", color: "text-warning", bg: "bg-warning/10 hover:bg-warning/20" },
  { icon: Wrench, label: "Nueva Instalación", color: "text-primary", bg: "bg-primary/10 hover:bg-primary/20" },
  { icon: CreditCard, label: "Registrar Pago", color: "text-accent", bg: "bg-accent/10 hover:bg-accent/20" },
  { icon: MapPin, label: "Nueva Zona", color: "text-chart-4", bg: "bg-chart-4/10 hover:bg-chart-4/20" },
  {
    icon: AlertTriangle,
    label: "Reportar Incidencia",
    color: "text-destructive",
    bg: "bg-destructive/10 hover:bg-destructive/20",
  },
]

export function QuickActions() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              className={`h-auto flex-col gap-2 p-4 ${action.bg} border border-border`}
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

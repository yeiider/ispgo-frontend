"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, CreditCard, Scissors, Wrench, AlertTriangle, Wifi, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const activities = [
  {
    id: 1,
    type: "new_client",
    title: "Nuevo cliente registrado",
    description: "María García López - Plan Fibra 100 Mbps",
    time: "Hace 5 min",
    icon: UserPlus,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    id: 2,
    type: "payment",
    title: "Pago recibido",
    description: "Juan Rodríguez - $449.00 MXN",
    time: "Hace 12 min",
    icon: CreditCard,
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
  },
  {
    id: 3,
    type: "cut",
    title: "Corte de servicio ejecutado",
    description: "Carlos Méndez - Falta de pago (2 meses)",
    time: "Hace 25 min",
    icon: Scissors,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
  },
  {
    id: 4,
    type: "installation",
    title: "Instalación completada",
    description: "Ana Fernández - Sector Norte #45",
    time: "Hace 1 hora",
    icon: Wrench,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    id: 5,
    type: "alert",
    title: "Incidencia reportada",
    description: "Nodo Sector Sur - Pérdida de señal",
    time: "Hace 2 horas",
    icon: AlertTriangle,
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
  },
  {
    id: 6,
    type: "reconnection",
    title: "Servicio reconectado",
    description: "Pedro Sánchez - Pago regularizado",
    time: "Hace 3 horas",
    icon: Wifi,
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
  },
]

export function RecentActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Actividad Reciente</CardTitle>
          <Badge variant="secondary" className="text-xs">
            Hoy
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors">
              <div className={cn("p-2 rounded-lg", activity.iconBg)}>
                <activity.icon className={cn("h-4 w-4", activity.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

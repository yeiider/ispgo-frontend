"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, MapPin, User, ChevronRight, Wrench, Scissors, AlertTriangle } from "lucide-react"

const pendingTasks = [
  {
    id: 1,
    type: "installation",
    title: "Instalación pendiente",
    client: "Roberto Díaz",
    address: "Av. Central #456, Sector Norte",
    time: "09:00 - 12:00",
    date: "Hoy",
    priority: "high",
  },
  {
    id: 2,
    type: "installation",
    title: "Instalación pendiente",
    client: "Carmen López",
    address: "Calle 5 #123, Sector Centro",
    time: "12:00 - 15:00",
    date: "Hoy",
    priority: "medium",
  },
  {
    id: 3,
    type: "cut",
    title: "Corte programado",
    client: "Miguel Hernández",
    address: "Av. Norte #789",
    time: "10:00",
    date: "Hoy",
    priority: "low",
  },
  {
    id: 4,
    type: "support",
    title: "Soporte técnico",
    client: "Lucía Martínez",
    address: "Calle Sur #234",
    time: "14:00 - 16:00",
    date: "Mañana",
    priority: "high",
  },
]

const priorityConfig = {
  high: { label: "Alta", color: "bg-destructive/20 text-destructive border-destructive/30" },
  medium: { label: "Media", color: "bg-warning/20 text-warning border-warning/30" },
  low: { label: "Baja", color: "bg-accent/20 text-accent border-accent/30" },
}

const typeIcons = {
  installation: Wrench,
  cut: Scissors,
  support: AlertTriangle,
}

export function PendingTasks() {
  const completedToday = 8
  const totalToday = 12
  const progress = (completedToday / totalToday) * 100

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tareas Pendientes</CardTitle>
          <Badge variant="secondary">{pendingTasks.length} pendientes</Badge>
        </div>
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso del día</span>
            <span className="font-medium">
              {completedToday}/{totalToday} completadas
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {pendingTasks.map((task) => {
            const Icon = typeIcons[task.type as keyof typeof typeIcons]
            return (
              <div key={task.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <Badge
                        variant="outline"
                        className={priorityConfig[task.priority as keyof typeof priorityConfig].color}
                      >
                        {priorityConfig[task.priority as keyof typeof priorityConfig].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{task.client}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{task.address}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-primary">
                        <Calendar className="h-3 w-3" />
                        {task.date}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {task.time}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            )
          })}
        </div>
        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full bg-transparent" size="sm">
            Ver todas las tareas
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

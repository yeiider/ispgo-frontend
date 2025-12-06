"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Wifi, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Activity, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: "increase" | "decrease"
  }
  icon: React.ReactNode
  iconColor?: string
  subtitle?: string
}

function StatCard({ title, value, change, icon, iconColor, subtitle }: StatCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
            {change && (
              <div className="flex items-center gap-1">
                {change.type === "increase" ? (
                  <TrendingUp className="h-4 w-4 text-accent" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={cn("text-sm font-medium", change.type === "increase" ? "text-accent" : "text-destructive")}
                >
                  {change.value}%
                </span>
                <span className="text-xs text-muted-foreground">vs mes anterior</span>
              </div>
            )}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn("p-3 rounded-xl", iconColor || "bg-primary/10")}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Clientes Activos"
        value="2,847"
        change={{ value: 12.5, type: "increase" }}
        icon={<Users className="h-6 w-6 text-primary" />}
        iconColor="bg-primary/10"
      />
      <StatCard
        title="Servicios Conectados"
        value="1,847"
        change={{ value: 8.2, type: "increase" }}
        icon={<Wifi className="h-6 w-6 text-accent" />}
        iconColor="bg-accent/10"
        subtitle="98.7% uptime este mes"
      />
      <StatCard
        title="Facturación Mensual"
        value="$284,750"
        change={{ value: 15.3, type: "increase" }}
        icon={<DollarSign className="h-6 w-6 text-warning" />}
        iconColor="bg-warning/10"
      />
      <StatCard
        title="Cortes Pendientes"
        value="45"
        change={{ value: 23, type: "decrease" }}
        icon={<AlertTriangle className="h-6 w-6 text-destructive" />}
        iconColor="bg-destructive/10"
        subtitle="Programados para hoy"
      />
    </div>
  )
}

export function NetworkStatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Tráfico Total"
        value="847 Gbps"
        change={{ value: 5.2, type: "increase" }}
        icon={<Activity className="h-6 w-6 text-primary" />}
        iconColor="bg-primary/10"
        subtitle="Pico: 1.2 Tbps"
      />
      <StatCard
        title="Nodos Activos"
        value="24/25"
        icon={<Zap className="h-6 w-6 text-accent" />}
        iconColor="bg-accent/10"
        subtitle="1 nodo en mantenimiento"
      />
      <StatCard
        title="Latencia Promedio"
        value="12ms"
        change={{ value: 8, type: "decrease" }}
        icon={<TrendingDown className="h-6 w-6 text-accent" />}
        iconColor="bg-accent/10"
      />
      <StatCard
        title="Incidencias Hoy"
        value="3"
        change={{ value: 40, type: "decrease" }}
        icon={<AlertTriangle className="h-6 w-6 text-warning" />}
        iconColor="bg-warning/10"
        subtitle="2 resueltas, 1 en progreso"
      />
    </div>
  )
}

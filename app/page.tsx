"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { StatsCards, NetworkStatsCards } from "@/components/dashboard/stats-cards"
import { BandwidthChart } from "@/components/dashboard/bandwidth-chart"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { DataTable } from "@/components/data-table/data-table"
import { ClientForm } from "@/components/forms/client-form"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { PendingTasks } from "@/components/dashboard/pending-tasks"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, Activity, Users, FileText } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Bienvenido de vuelta{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. Aquí está el resumen de tu ISP
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Última actualización:</span>
            <span className="font-mono text-primary">Hace 2 minutos</span>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-card">
              <LayoutDashboard className="h-4 w-4" />
              Resumen General
            </TabsTrigger>
            <TabsTrigger value="network" className="gap-2 data-[state=active]:bg-card">
              <Activity className="h-4 w-4" />
              Monitoreo de Red
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2 data-[state=active]:bg-card">
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="forms" className="gap-2 data-[state=active]:bg-card">
              <FileText className="h-4 w-4" />
              Formularios
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <StatsCards />
            <QuickActions />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BandwidthChart />
              <RevenueChart />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity />
              <PendingTasks />
            </div>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network" className="space-y-6">
            <NetworkStatsCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BandwidthChart />
              <RecentActivity />
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <DataTable />
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            <ClientForm />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

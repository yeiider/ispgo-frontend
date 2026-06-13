"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Wifi,
  User,
  Calendar,
  Edit,
  ArrowLeft,
  Globe,
  FileText,
  Loader2,
  AlertCircle,
  Activity,
  Hash,
  Satellite,
  MapPin,
  RadioTower,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Service } from "@/lib/graphql/types"
import { getService } from "@/app/actions/services"
import { ActivateServiceButton, SuspendServiceButton } from "@/components/actions/service-status-actions"
import { SmartOltActions } from "@/components/actions/smart-olt-actions"

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Activo", color: "bg-accent/20 text-accent border-accent/30" },
  inactive: { label: "Inactivo", color: "bg-muted/50 text-muted-foreground border-muted" },
  suspended: { label: "Suspendido", color: "bg-warning/20 text-warning border-warning/30" },
  cancelled: { label: "Cancelado", color: "bg-destructive/20 text-destructive border-destructive/30" },
  pending: { label: "Pendiente", color: "bg-primary/20 text-primary border-primary/30" },
  free: { label: "Gratuito", color: "bg-blue-500/20 text-blue-500 border-blue-500/30" },
}

const serviceTypeConfig: Record<string, { label: string; color: string }> = {
  ftth: { label: "FTTH (Fibra Óptica)", color: "bg-accent/20 text-accent border-accent/30" },
  adsl: { label: "ADSL", color: "bg-primary/20 text-primary border-primary/30" },
  satellite: { label: "Satelital", color: "bg-warning/20 text-warning border-warning/30" },
}

const invoiceStatusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: "Pagada", color: "bg-accent/20 text-accent border-accent/30" },
  pending: { label: "Pendiente", color: "bg-warning/20 text-warning border-warning/30" },
  overdue: { label: "Vencida", color: "bg-destructive/20 text-destructive border-destructive/30" },
}

interface ServiceDetailProps {
  serviceId: string
}

export function ServiceDetail({ serviceId }: ServiceDetailProps) {
  const router = useRouter()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchService = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getService(serviceId)
      if (result.success && result.data) {
        setService(result.data)
      } else {
        setError(result.error || "Error al cargar el servicio")
      }
    } catch (err) {
      setError("Error al cargar el servicio")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchService()
  }, [serviceId])

  const getStatusConfig = (status?: string) => {
    return statusConfig[status || "active"] || statusConfig.active
  }

  const getServiceTypeConfig = (type?: string) => {
    return serviceTypeConfig[type || "ftth"] || serviceTypeConfig.ftth
  }

  const handleActionSuccess = () => {
    fetchService()
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          Cargando información del servicio...
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/services">
            <ArrowLeft className="h-4 w-4" />
            Volver a servicios
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Servicio no encontrado"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href="/services">
              <ArrowLeft className="h-4 w-4" />
              Servicios
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Wifi className="h-6 w-6 text-primary" />
                {service.plan?.name || "Servicio"}
              </h1>
              <Badge variant="outline" className={getStatusConfig(service.service_status).color}>
                {getStatusConfig(service.service_status).label}
              </Badge>
              {service.service_type && (
                <Badge variant="outline" className={getServiceTypeConfig(service.service_type).color}>
                  {getServiceTypeConfig(service.service_type).label}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              ID: #{service.id} · {service.service_ip || "Sin IP asignada"}
              {service.sn && ` · SN: ${service.sn}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ActivateServiceButton
            serviceId={serviceId}
            currentStatus={service.service_status}
            onSuccess={handleActionSuccess}
          />
          <SuspendServiceButton
            serviceId={serviceId}
            currentStatus={service.service_status}
            onSuccess={handleActionSuccess}
          />
          <Button variant="outline" asChild className="gap-2 bg-transparent">
            <Link href={`/services/${serviceId}/edit`}>
              <Edit className="h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-card">
            <Wifi className="h-4 w-4" />
            Información
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2 data-[state=active]:bg-card">
            <FileText className="h-4 w-4" />
            Facturas ({service.invoices?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2 data-[state=active]:bg-card">
            <Activity className="h-4 w-4" />
            Actividad
          </TabsTrigger>
          {service.sn && (
            <TabsTrigger value="actions" className="gap-2 data-[state=active]:bg-card">
              <RadioTower className="h-4 w-4" />
              Acciones
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Service Info */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-primary" />
                  Detalles del Servicio
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium">{service.plan?.name || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Precio Mensual</p>
                  <p className="font-medium text-lg">
                    {service.plan?.monthly_price
                      ? new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        }).format(service.plan.monthly_price)
                      : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Dirección IP
                  </p>
                  <p className="font-mono">{service.service_ip || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Satellite className="h-4 w-4" />
                    Tipo de Servicio
                  </p>
                  <p className="font-medium">{getServiceTypeConfig(service.service_type).label}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Número de Serie (SN)
                  </p>
                  <p className="font-mono">{service.sn || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Router</p>
                  <p className="font-medium">{service.router?.name || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Instalación
                  </p>
                  <p className="font-medium">
                    {service.installation_date
                      ? new Date(service.installation_date).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Activación
                  </p>
                  <p className="font-medium">
                    {service.activation_date
                      ? new Date(service.activation_date).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
                {service.address && (
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Ubicación de Instalación
                    </p>
                    <p className="font-medium">
                      {service.address.address}
                      {service.address.city && `, ${service.address.city}`}
                      {service.address.state_province && `, ${service.address.state_province}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.customer ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <Link
                          href={`/clients/${service.customer.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {service.customer.first_name} {service.customer.last_name}
                        </Link>
                        <p className="text-sm text-muted-foreground">{service.customer.email_address || "-"}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{service.customer.phone_number || "-"}</p>
                    </div>
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href={`/clients/${service.customer.id}`}>Ver perfil completo</Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Sin cliente asignado</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Geolocation Card */}
          {(service.unu_latitude || service.unu_longitude) && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Geolocalización UNU
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Latitud</p>
                  <p className="font-mono">{service.unu_latitude || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Longitud</p>
                  <p className="font-mono">{service.unu_longitude || "-"}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Actions Tab — Gestión de Equipo SmartOLT */}
        <TabsContent value="actions" className="space-y-6">
          {service.sn && (
            <SmartOltActions
              serviceId={serviceId}
              sn={service.sn}
              onActionSuccess={handleActionSuccess}
            />
          )}
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Facturas del Servicio</CardTitle>
              <CardDescription>Historial de facturación</CardDescription>
            </CardHeader>
            <CardContent>
              {service.invoices && service.invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Factura</th>
                        <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Fecha Emisión
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Vencimiento
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Estado</th>
                        <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase">Total</th>
                        <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {service.invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-border hover:bg-muted/30">
                          <td className="p-3">
                            <span className="font-mono text-primary">{invoice.increment_id || `#${invoice.id}`}</span>
                          </td>
                          <td className="p-3 text-sm">
                            {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString("es-ES") : "-"}
                          </td>
                          <td className="p-3 text-sm">
                            {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("es-ES") : "-"}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={
                                invoiceStatusConfig[invoice.status]?.color || invoiceStatusConfig.pending.color
                              }
                            >
                              {invoiceStatusConfig[invoice.status]?.label || invoice.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right font-mono font-medium">${invoice.total.toLocaleString()}</td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/billing/invoices/${invoice.id}`}>Ver</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay facturas registradas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Actividad del Servicio</CardTitle>
              <CardDescription>Historial de eventos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay actividad reciente registrada</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

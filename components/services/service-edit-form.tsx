"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Loader2,
  Wifi,
  Globe,
  Calendar,
  AlertCircle,
  User,
  Server,
  Hash,
  Satellite,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import type { Service, Router as RouterType, Plan } from "@/lib/graphql/types"
import { getService, updateService } from "@/app/actions/services"
import { getAllRouters } from "@/app/actions/routers"
import { getAllPlans } from "@/app/actions/plans"

interface ServiceEditFormProps {
  serviceId: string
}

const formatDateTimeForLaravel = (dateTimeLocal: string): string | undefined => {
  if (!dateTimeLocal) return undefined
  // Convert from "2025-01-02T00:00" to "2025-01-02 00:00:00"
  return dateTimeLocal.replace("T", " ") + ":00"
}

export function ServiceEditForm({ serviceId }: ServiceEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [service, setService] = useState<Service | null>(null)
  const [routers, setRouters] = useState<RouterType[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingRouters, setLoadingRouters] = useState(true)
  const [loadingPlans, setLoadingPlans] = useState(true)

  const [formData, setFormData] = useState({
    service_ip: "",
    service_status: "active",
    plan_id: "",
    router_id: "",
    sn: "",
    unu_longitude: "",
    unu_latitude: "",
    service_type: "ftth",
    activation_date: "",
    installation_date: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [serviceResult, routersResult, plansResult] = await Promise.all([
          getService(serviceId),
          getAllRouters(),
          getAllPlans(),
        ])

        if (serviceResult.success && serviceResult.data) {
          setService(serviceResult.data)
          const formatDateForInput = (date: string | undefined) => {
            if (!date) return ""
            // Convert "2025-01-02 00:00:00" to "2025-01-02T00:00"
            return date.replace(" ", "T").slice(0, 16)
          }
          setFormData({
            service_ip: serviceResult.data.service_ip || "",
            service_status: serviceResult.data.service_status || "active",
            plan_id: serviceResult.data.plan?.id || "",
            router_id: serviceResult.data.router?.id || "",
            sn: serviceResult.data.sn || "",
            unu_longitude: serviceResult.data.unu_longitude || "",
            unu_latitude: serviceResult.data.unu_latitude || "",
            service_type: serviceResult.data.service_type || "ftth",
            activation_date: formatDateForInput(serviceResult.data.activation_date),
            installation_date: formatDateForInput(serviceResult.data.installation_date),
          })
        } else {
          setError(serviceResult.error || "Error al cargar el servicio")
        }

        if (routersResult.success && routersResult.data) {
          setRouters(routersResult.data)
        }

        if (plansResult.success && plansResult.data) {
          setPlans(plansResult.data)
        }
      } catch (err) {
        setError("Error al cargar el servicio")
      } finally {
        setLoading(false)
        setLoadingRouters(false)
        setLoadingPlans(false)
      }
    }
    fetchData()
  }, [serviceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const result = await updateService({
        id: serviceId,
        service_ip: formData.service_ip || undefined,
        service_status: formData.service_status || undefined,
        plan_id: formData.plan_id ? Number(formData.plan_id) : undefined,
        router_id: formData.router_id ? Number(formData.router_id) : undefined,
        sn: formData.sn || undefined,
        unu_longitude: formData.unu_longitude || undefined,
        unu_latitude: formData.unu_latitude || undefined,
        service_type: formData.service_type || undefined,
        activation_date: formatDateTimeForLaravel(formData.activation_date),
        installation_date: formatDateTimeForLaravel(formData.installation_date),
      })
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/services/${serviceId}`)
        }, 1500)
      } else {
        setError(result.error || "Error al actualizar el servicio")
      }
    } catch (err) {
      setError("Error al actualizar el servicio")
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href={`/services/${serviceId}`}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Editar Servicio</h1>
            <p className="text-sm text-muted-foreground">Modifica la configuración del servicio #{serviceId}</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-accent/10 border-accent/30 text-accent">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Servicio actualizado correctamente. Redirigiendo...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info (read-only) */}
        {service?.customer && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">
                    {service.customer.first_name} {service.customer.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{service.customer.email_address || "Sin email"}</p>
                </div>
                <Button variant="outline" asChild className="ml-auto bg-transparent">
                  <Link href={`/clients/${service.customer.id}`}>Ver cliente</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Configuration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wifi className="h-5 w-5 text-primary" />
              Configuración del Servicio
            </CardTitle>
            <CardDescription>Parámetros técnicos del servicio</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="service_ip" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Dirección IP
              </Label>
              <Input
                id="service_ip"
                value={formData.service_ip}
                onChange={(e) => setFormData({ ...formData, service_ip: e.target.value })}
                placeholder="192.168.1.100"
                className="bg-secondary/50 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_status">Estado del Servicio</Label>
              <Select
                value={formData.service_status}
                onValueChange={(value) => setFormData({ ...formData, service_status: value })}
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="suspended">Suspendido</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="free">Gratuito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_type" className="flex items-center gap-2">
                <Satellite className="h-4 w-4" />
                Tipo de Servicio
              </Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData({ ...formData, service_type: value })}
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ftth">FTTH (Fibra Óptica)</SelectItem>
                  <SelectItem value="adsl">ADSL</SelectItem>
                  <SelectItem value="satellite">Satelital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan_id">Plan de Internet</Label>
              <Select
                value={formData.plan_id}
                onValueChange={(value) => setFormData({ ...formData, plan_id: value })}
                disabled={loadingPlans}
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder={loadingPlans ? "Cargando..." : "Seleccionar plan"} />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <span>{p.name}</span>
                        <span className="text-xs text-accent font-medium">{formatCurrency(p.monthly_price)}/mes</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="router_id" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Router de Segmentación
              </Label>
              <Select
                value={formData.router_id}
                onValueChange={(value) => setFormData({ ...formData, router_id: value })}
                disabled={loadingRouters}
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder={loadingRouters ? "Cargando..." : "Seleccionar router"} />
                </SelectTrigger>
                <SelectContent>
                  {routers.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span>{r.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sn" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Número de Serie (SN)
              </Label>
              <Input
                id="sn"
                value={formData.sn}
                onChange={(e) => setFormData({ ...formData, sn: e.target.value })}
                placeholder="SN123456789"
                className="bg-secondary/50 font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Geolocation & Dates */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Geolocalización y Fechas
            </CardTitle>
            <CardDescription>Coordenadas GPS y fechas de instalación/activación</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="unu_longitude">Longitud (UNU)</Label>
              <Input
                id="unu_longitude"
                value={formData.unu_longitude}
                onChange={(e) => setFormData({ ...formData, unu_longitude: e.target.value })}
                placeholder="-74.0721"
                className="bg-secondary/50 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unu_latitude">Latitud (UNU)</Label>
              <Input
                id="unu_latitude"
                value={formData.unu_latitude}
                onChange={(e) => setFormData({ ...formData, unu_latitude: e.target.value })}
                placeholder="4.7110"
                className="bg-secondary/50 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="installation_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha de Instalación
              </Label>
              <Input
                id="installation_date"
                type="datetime-local"
                value={formData.installation_date}
                onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activation_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha de Activación
              </Label>
              <Input
                id="activation_date"
                type="datetime-local"
                value={formData.activation_date}
                onChange={(e) => setFormData({ ...formData, activation_date: e.target.value })}
                className="bg-secondary/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/services/${serviceId}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}

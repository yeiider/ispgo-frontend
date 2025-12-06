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
  User,
  AlertCircle,
  Search,
  Server,
  CreditCard,
  MapPin,
  Hash,
  Satellite,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import type { Router as RouterType, Plan, Address } from "@/lib/graphql/types"
import { getCustomerAddresses } from "@/app/actions/customers"
import { createService } from "@/app/actions/services"
import { getAllRouters } from "@/app/actions/routers"
import { getAllPlans } from "@/app/actions/plans"

interface ServiceNewFormProps {
  customerId?: string
}

const formatDateTimeForLaravel = (dateTimeLocal: string): string | undefined => {
  if (!dateTimeLocal) return undefined
  // datetime-local can be "2025-01-02T00:00" or "2025-01-02T00:00:00"
  // Laravel expects "2025-01-02 00:00:00"
  const cleaned = dateTimeLocal.replace("T", " ")
  // Check if seconds are missing
  const parts = cleaned.split(" ")
  if (parts.length === 2) {
    const timeParts = parts[1].split(":")
    if (timeParts.length === 2) {
      // Missing seconds, add ":00"
      return `${parts[0]} ${parts[1]}:00`
    } else if (timeParts.length === 3) {
      // Already has seconds
      return cleaned
    }
  }
  return cleaned
}

export function ServiceNewForm({ customerId }: ServiceNewFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [customer, setCustomer] = useState<{
    id: string
    first_name: string
    last_name: string
    addresses: Address[]
  } | null>(null)
  const [loadingCustomer, setLoadingCustomer] = useState(false)
  const [routers, setRouters] = useState<RouterType[]>([])
  const [loadingRouters, setLoadingRouters] = useState(true)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)

  const [formData, setFormData] = useState({
    customer_id: customerId || "",
    service_ip: "",
    service_status: "active",
    plan_id: "",
    router_id: "",
    service_location: "",
    sn: "",
    unu_longitude: "",
    unu_latitude: "",
    service_type: "ftth",
    activation_date: "",
    installation_date: "",
  })

  useEffect(() => {
    const fetchRouters = async () => {
      try {
        const result = await getAllRouters()
        if (result.success && result.data) {
          setRouters(result.data)
        }
      } catch (err) {
        console.error("Error fetching routers:", err)
      } finally {
        setLoadingRouters(false)
      }
    }

    const fetchPlans = async () => {
      try {
        const result = await getAllPlans()
        if (result.success && result.data) {
          setPlans(result.data)
        }
      } catch (err) {
        console.error("Error fetching plans:", err)
      } finally {
        setLoadingPlans(false)
      }
    }

    fetchRouters()
    fetchPlans()

    if (customerId) {
      fetchCustomer(customerId)
    }
  }, [customerId])

  const fetchCustomer = async (id: string) => {
    setLoadingCustomer(true)
    try {
      const result = await getCustomerAddresses(id)
      if (result.success && result.data) {
        setCustomer(result.data)
        setFormData((prev) => ({ ...prev, customer_id: id, service_location: "" }))
      } else {
        setError("Cliente no encontrado")
      }
    } catch (err) {
      console.error("Error fetching customer:", err)
      setError("Error al buscar el cliente")
    } finally {
      setLoadingCustomer(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customer_id) {
      setError("Debe seleccionar un cliente")
      return
    }

    if (!formData.plan_id) {
      setError("Debe seleccionar un plan")
      return
    }

    if (!formData.router_id) {
      setError("Debe seleccionar un router")
      return
    }

    if (!formData.service_ip) {
      setError("Debe ingresar una dirección IP")
      return
    }

    if (!formData.service_location) {
      setError("Debe seleccionar una dirección de instalación")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const activationDateFormatted = formData.activation_date
        ? formatDateTimeForLaravel(formData.activation_date)
        : undefined
      const installationDateFormatted = formData.installation_date
        ? formatDateTimeForLaravel(formData.installation_date)
        : undefined

      console.log("[v0] activation_date input:", formData.activation_date)
      console.log("[v0] activation_date formatted:", activationDateFormatted)

      const result = await createService({
        customer_id: Number(formData.customer_id),
        plan_id: Number(formData.plan_id),
        router_id: Number(formData.router_id),
        service_ip: formData.service_ip,
        service_location: Number(formData.service_location),
        service_status: formData.service_status || undefined,
        sn: formData.sn || undefined,
        unu_longitude: formData.unu_longitude || undefined,
        unu_latitude: formData.unu_latitude || undefined,
        service_type: formData.service_type || undefined,
        activation_date: activationDateFormatted,
        installation_date: installationDateFormatted,
      })
      if (result.success && result.data) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/services/${result.data!.id}`)
        }, 1500)
      } else {
        setError(result.error || "Error al crear el servicio")
      }
    } catch (err) {
      setError("Error al crear el servicio")
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

  const hasAddresses = customer && customer.addresses && customer.addresses.length > 0

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href="/services">
              <ArrowLeft className="h-4 w-4" />
              Servicios
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Wifi className="h-6 w-6 text-primary" />
              Nuevo Servicio
            </h1>
            <p className="text-sm text-muted-foreground">Configura un nuevo servicio de internet</p>
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
          <AlertDescription>Servicio creado correctamente. Redirigiendo...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Cliente
            </CardTitle>
            <CardDescription>Selecciona el cliente para el nuevo servicio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer ? (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ID: #{customer.id} · {customer.addresses?.length || 0} direcciones registradas
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCustomer(null)
                    setFormData((prev) => ({ ...prev, customer_id: "", service_location: "" }))
                  }}
                  className="bg-transparent"
                >
                  Cambiar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente por ID..."
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="pl-9 bg-secondary/50"
                  />
                </div>
                {formData.customer_id && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fetchCustomer(formData.customer_id)}
                    disabled={loadingCustomer}
                    className="gap-2"
                  >
                    {loadingCustomer ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Buscar Cliente
                  </Button>
                )}
                <p className="text-sm text-muted-foreground">
                  Ingresa el ID del cliente o{" "}
                  <Link href="/clients/new" className="text-primary hover:underline">
                    crea uno nuevo
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Location - Only show when customer is selected */}
        {customer && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Ubicación del Servicio
              </CardTitle>
              <CardDescription>Selecciona la dirección donde se instalará el servicio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasAddresses ? (
                <div className="space-y-2">
                  <Label htmlFor="service_location">Dirección de Instalación *</Label>
                  <Select
                    value={formData.service_location}
                    onValueChange={(value) => setFormData({ ...formData, service_location: value })}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Seleccionar dirección" />
                    </SelectTrigger>
                    <SelectContent>
                      {customer.addresses?.map((addr) => (
                        <SelectItem key={addr.id} value={addr.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{addr.address}</span>
                            {addr.city && <span className="text-xs text-muted-foreground">- {addr.city}</span>}
                            {addr.address_type && (
                              <span className="text-xs bg-secondary px-2 py-0.5 rounded">{addr.address_type}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Este cliente no tiene direcciones registradas.{" "}
                    <Link href={`/clients/${customer.id}/edit`} className="text-primary hover:underline font-medium">
                      Agregar dirección
                    </Link>
                  </AlertDescription>
                </Alert>
              )}
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
            <CardDescription>Parámetros técnicos del nuevo servicio</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="plan_id" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Plan de Internet *
              </Label>
              <Select
                value={formData.plan_id}
                onValueChange={(value) => setFormData({ ...formData, plan_id: value })}
                disabled={loadingPlans}
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder={loadingPlans ? "Cargando planes..." : "Seleccionar plan"} />
                </SelectTrigger>
                <SelectContent>
                  {plans
                    .filter((p) => p.status === "active")
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>{p.name}</span>
                          <span className="text-xs text-accent font-medium ml-2">
                            {formatCurrency(p.monthly_price)}/mes
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                <Link href="/plans/new" className="text-primary hover:underline">
                  Crear nuevo plan
                </Link>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_status">Estado del Servicio *</Label>
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
                Tipo de Servicio *
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
              <Label htmlFor="router_id" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Router de Segmentación *
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
              <p className="text-xs text-muted-foreground">Router al que se asignará el servicio</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_ip" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Dirección IP *
              </Label>
              <Input
                id="service_ip"
                value={formData.service_ip}
                onChange={(e) => setFormData({ ...formData, service_ip: e.target.value })}
                placeholder="192.168.1.100"
                className="bg-secondary/50 font-mono"
              />
              <p className="text-xs text-muted-foreground">Formato IPv4 requerido (ej: 192.168.1.100)</p>
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
              <p className="text-xs text-muted-foreground">Serial del equipo ONU/ONT</p>
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
            <Link href="/services">Cancelar</Link>
          </Button>
          <Button
            type="submit"
            disabled={
              saving ||
              !formData.customer_id ||
              !formData.plan_id ||
              !formData.router_id ||
              !formData.service_ip ||
              !formData.service_location
            }
            className="gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Crear Servicio
          </Button>
        </div>
      </form>
    </div>
  )
}

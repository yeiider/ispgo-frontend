"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Wifi, Globe, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CreateServiceInput, UpdateServiceInput } from "@/lib/graphql/types"
import { createService, updateService, getService } from "@/app/actions/services"

interface ServiceFormProps {
  serviceId?: string
  mode: "create" | "edit"
}

const mockPlans = [
  { id: "1", name: "Fibra 50 Mbps", monthly_price: 299 },
  { id: "2", name: "Fibra 100 Mbps", monthly_price: 449 },
  { id: "3", name: "Fibra 200 Mbps", monthly_price: 649 },
  { id: "4", name: "Fibra 300 Mbps", monthly_price: 899 },
]

export function ServiceForm({ serviceId, mode }: ServiceFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerIdFromUrl = searchParams.get("customer")

  const [loading, setLoading] = useState(false)
  const [fetchingService, setFetchingService] = useState(mode === "edit")
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    customer_id: customerIdFromUrl || "",
    plan_id: "",
    service_ip: "",
    service_status: "active",
  })

  useEffect(() => {
    if (mode === "edit" && serviceId) {
      const fetchService = async () => {
        setFetchingService(true)
        try {
          const result = await getService(serviceId)
          if (result.success && result.data) {
            setFormData({
              customer_id: result.data.customer?.id?.toString() || "",
              plan_id: result.data.plan_id?.toString() || "",
              service_ip: result.data.service_ip || "",
              service_status: result.data.service_status || "active",
            })
          } else {
            setError(result.error || "Error al cargar el servicio")
          }
        } catch (err) {
          setError("Error al cargar el servicio")
        } finally {
          setFetchingService(false)
        }
      }
      fetchService()
    }
  }, [serviceId, mode])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === "create") {
        const input: CreateServiceInput = {
          customer_id: Number.parseInt(formData.customer_id),
          plan_id: formData.plan_id ? Number.parseInt(formData.plan_id) : undefined,
          service_ip: formData.service_ip || undefined,
          service_status: formData.service_status,
        }
        const result = await createService(input)
        if (result.success) {
          router.push("/services")
        } else {
          setError(result.error || "Error al crear el servicio")
        }
      } else if (serviceId) {
        const input: UpdateServiceInput = {
          id: serviceId,
          plan_id: formData.plan_id ? Number.parseInt(formData.plan_id) : undefined,
          service_ip: formData.service_ip || undefined,
          service_status: formData.service_status,
        }
        const result = await updateService(input)
        if (result.success) {
          router.push(`/services/${serviceId}`)
        } else {
          setError(result.error || "Error al actualizar el servicio")
        }
      }
    } catch (err) {
      setError("Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  if (fetchingService) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href={mode === "edit" && serviceId ? `/services/${serviceId}` : "/services"}>
              <ArrowLeft className="h-4 w-4" />
              {mode === "edit" ? "Volver al servicio" : "Servicios"}
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === "create" ? "Nuevo Servicio" : "Editar Servicio"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "create" ? "Configure un nuevo servicio de internet" : "Modifique la información del servicio"}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wifi className="h-5 w-5 text-primary" />
              Configuración del Servicio
            </CardTitle>
            <CardDescription>Información del servicio de internet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customer_id" className="text-sm font-medium">
                  ID del Cliente <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer_id"
                    type="number"
                    value={formData.customer_id}
                    onChange={(e) => handleChange("customer_id", e.target.value)}
                    placeholder="ID del cliente"
                    className="pl-9 bg-secondary/50"
                    required
                    disabled={mode === "edit"}
                  />
                </div>
                {mode === "edit" && <p className="text-xs text-muted-foreground">El cliente no puede ser modificado</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_id" className="text-sm font-medium">
                  Plan de Internet
                </Label>
                <Select value={formData.plan_id} onValueChange={(v) => handleChange("plan_id", v)}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Seleccionar plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.monthly_price}/mes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_ip" className="text-sm font-medium">
                  Dirección IP
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="service_ip"
                    value={formData.service_ip}
                    onChange={(e) => handleChange("service_ip", e.target.value)}
                    placeholder="192.168.1.100"
                    className="pl-9 bg-secondary/50 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_status" className="text-sm font-medium">
                  Estado del Servicio
                </Label>
                <Select value={formData.service_status} onValueChange={(v) => handleChange("service_status", v)}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="suspended">Suspendido</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="bg-transparent"
                onClick={() => router.push(mode === "edit" && serviceId ? `/services/${serviceId}` : "/services")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "create" ? "Creando..." : "Guardando..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {mode === "create" ? "Crear Servicio" : "Guardar Cambios"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

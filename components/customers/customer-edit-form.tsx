"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Mail,
  Phone,
  FileText,
  MapPin,
  AlertCircle,
  Plus,
  Trash2,
  Server,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import type { Address, Router as RouterType } from "@/lib/graphql/types"
import { getCustomer, updateCustomer } from "@/app/actions/customers"
import { getAllRouters } from "@/app/actions/routers"

const DOCUMENT_TYPES = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "NIT", label: "NIT" },
  { value: "TI", label: "Tarjeta de Identidad" },
  { value: "PAS", label: "Pasaporte" },
]

interface CustomerEditFormProps {
  customerId: string
}

export function CustomerEditForm({ customerId }: CustomerEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [routers, setRouters] = useState<RouterType[]>([])
  const [loadingRouters, setLoadingRouters] = useState(true)

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    phone_number: "",
    identity_document: "",
    document_type: "CC",
    customer_status: "active",
    router_id: "",
  })

  const [addresses, setAddresses] = useState<Partial<Address>[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [customerResult, routersResult] = await Promise.all([getCustomer(customerId), getAllRouters()])

        if (customerResult.success && customerResult.data) {
          const customer = customerResult.data
          setFormData({
            first_name: customer.first_name || "",
            last_name: customer.last_name || "",
            email_address: customer.email_address || "",
            phone_number: customer.phone_number || "",
            identity_document: customer.identity_document || "",
            document_type: customer.document_type || "CC",
            customer_status: customer.customer_status || "active",
            router_id: customer.router?.id || "",
          })
          setAddresses(customer.addresses || [])
        } else {
          setError(customerResult.error || "Error al cargar el cliente")
        }

        if (routersResult.success && routersResult.data) {
          setRouters(routersResult.data)
        }
      } catch (err) {
        setError("Error al cargar el cliente")
      } finally {
        setLoading(false)
        setLoadingRouters(false)
      }
    }
    fetchData()
  }, [customerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const result = await updateCustomer({
        id: customerId,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        email_address: formData.email_address || undefined,
        phone_number: formData.phone_number || undefined,
        document_type: formData.document_type || undefined,
        router_id: formData.router_id ? Number(formData.router_id) : undefined,
      })
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/clients/${customerId}`)
        }, 1500)
      } else {
        setError(result.error || "Error al actualizar el cliente")
      }
    } catch (err) {
      setError("Error al actualizar el cliente")
    } finally {
      setSaving(false)
    }
  }

  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        address: "",
        city: "",
        state_province: "",
        postal_code: "",
        country: "",
        address_type: "service",
      },
    ])
  }

  const removeAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index))
  }

  const updateAddress = (index: number, field: string, value: string) => {
    const newAddresses = [...addresses]
    newAddresses[index] = { ...newAddresses[index], [field]: value }
    setAddresses(newAddresses)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          Cargando información del cliente...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4x2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href={`/clients/${customerId}`}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Editar Cliente</h1>
            <p className="text-sm text-muted-foreground">Modifica la información del cliente #{customerId}</p>
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
          <AlertDescription>Cliente actualizado correctamente. Redirigiendo...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Información Personal
            </CardTitle>
            <CardDescription>Datos básicos del cliente</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Juan"
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Pérez"
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document_type" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tipo de Documento
              </Label>
              <Select
                value={formData.document_type}
                onValueChange={(value) => setFormData({ ...formData, document_type: value })}
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="identity_document" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Número de Documento
              </Label>
              <Input
                id="identity_document"
                value={formData.identity_document}
                onChange={(e) => setFormData({ ...formData, identity_document: e.target.value })}
                placeholder="12345678"
                disabled
                className="bg-muted font-mono"
              />
              <p className="text-xs text-muted-foreground">El documento no puede ser modificado</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_status">Estado</Label>
              <Select
                value={formData.customer_status}
                onValueChange={(value) => setFormData({ ...formData, customer_status: value })}
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="suspended">Suspendido</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
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
                        <span className="text-xs text-muted-foreground font-mono">({r.ip_address})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Información de Contacto
            </CardTitle>
            <CardDescription>Datos para comunicarse con el cliente</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email_address" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email_address"
                type="email"
                value={formData.email_address}
                onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                placeholder="juan@ejemplo.com"
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
              </Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+52 123 456 7890"
                className="bg-secondary/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Direcciones
              </CardTitle>
              <CardDescription>Direcciones asociadas al cliente</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addAddress} className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {addresses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay direcciones registradas</p>
                <Button type="button" variant="link" onClick={addAddress} className="mt-2">
                  Agregar primera dirección
                </Button>
              </div>
            ) : (
              addresses.map((address, index) => (
                <div key={index} className="p-4 rounded-lg bg-secondary/30 border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Dirección {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAddress(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Dirección</Label>
                      <Input
                        value={address.address || ""}
                        onChange={(e) => updateAddress(index, "address", e.target.value)}
                        placeholder="Calle, número, colonia"
                        className="bg-card"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ciudad</Label>
                      <Input
                        value={address.city || ""}
                        onChange={(e) => updateAddress(index, "city", e.target.value)}
                        placeholder="Ciudad"
                        className="bg-card"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado/Provincia</Label>
                      <Input
                        value={address.state_province || ""}
                        onChange={(e) => updateAddress(index, "state_province", e.target.value)}
                        placeholder="Estado"
                        className="bg-card"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Código Postal</Label>
                      <Input
                        value={address.postal_code || ""}
                        onChange={(e) => updateAddress(index, "postal_code", e.target.value)}
                        placeholder="12345"
                        className="bg-card font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={address.address_type || "service"}
                        onValueChange={(value) => updateAddress(index, "address_type", value)}
                      >
                        <SelectTrigger className="bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Servicio</SelectItem>
                          <SelectItem value="billing">Facturación</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/clients/${customerId}`}>Cancelar</Link>
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

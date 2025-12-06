"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, User, Mail, Phone, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import type { CreateCustomerInput, UpdateCustomerInput } from "@/lib/graphql/types"
import { createCustomer, updateCustomer, getCustomer } from "@/app/actions/customers"

interface CustomerFormProps {
  customerId?: string
  mode: "create" | "edit"
}

export function CustomerForm({ customerId, mode }: CustomerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingCustomer, setFetchingCustomer] = useState(mode === "edit")
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    phone_number: "",
    identity_document: "",
  })

  useEffect(() => {
    if (mode === "edit" && customerId) {
      const fetchCustomer = async () => {
        setFetchingCustomer(true)
        try {
          const result = await getCustomer(customerId)
          if (result.success && result.data) {
            setFormData({
              first_name: result.data.first_name || "",
              last_name: result.data.last_name || "",
              email_address: result.data.email_address || "",
              phone_number: result.data.phone_number || "",
              identity_document: result.data.identity_document || "",
            })
          } else {
            setError(result.error || "Error al cargar el cliente")
          }
        } catch (err) {
          setError("Error al cargar el cliente")
        } finally {
          setFetchingCustomer(false)
        }
      }
      fetchCustomer()
    }
  }, [customerId, mode])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === "create") {
        const input: CreateCustomerInput = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email_address: formData.email_address || undefined,
          phone_number: formData.phone_number || undefined,
          identity_document: formData.identity_document,
        }
        const result = await createCustomer(input)
        if (result.success) {
          router.push("/clients")
        } else {
          setError(result.error || "Error al crear el cliente")
        }
      } else if (customerId) {
        const input: UpdateCustomerInput = {
          id: customerId,
          first_name: formData.first_name || undefined,
          last_name: formData.last_name || undefined,
          email_address: formData.email_address || undefined,
          phone_number: formData.phone_number || undefined,
        }
        const result = await updateCustomer(input)
        if (result.success) {
          router.push(`/clients/${customerId}`)
        } else {
          setError(result.error || "Error al actualizar el cliente")
        }
      }
    } catch (err) {
      setError("Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  if (fetchingCustomer) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href={mode === "edit" && customerId ? `/clients/${customerId}` : "/clients"}>
              <ArrowLeft className="h-4 w-4" />
              {mode === "edit" ? "Volver al cliente" : "Clientes"}
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === "create" ? "Nuevo Cliente" : "Editar Cliente"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "create"
                ? "Complete la información para registrar un nuevo cliente"
                : "Modifique la información del cliente"}
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
              <User className="h-5 w-5 text-primary" />
              Datos Personales
            </CardTitle>
            <CardDescription>Información básica del cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-medium">
                  Nombre(s) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  placeholder="Ej: María Elena"
                  className="bg-secondary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium">
                  Apellidos <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  placeholder="Ej: García López"
                  className="bg-secondary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_address" className="text-sm font-medium">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email_address"
                    type="email"
                    value={formData.email_address}
                    onChange={(e) => handleChange("email_address", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="pl-9 bg-secondary/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-sm font-medium">
                  Teléfono
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleChange("phone_number", e.target.value)}
                    placeholder="+52 555 123 4567"
                    className="pl-9 bg-secondary/50"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="identity_document" className="text-sm font-medium">
                  Documento de Identidad {mode === "create" && <span className="text-destructive">*</span>}
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="identity_document"
                    value={formData.identity_document}
                    onChange={(e) => handleChange("identity_document", e.target.value)}
                    placeholder="Número de documento"
                    className="pl-9 bg-secondary/50 font-mono"
                    required={mode === "create"}
                    disabled={mode === "edit"}
                  />
                </div>
                {mode === "edit" && (
                  <p className="text-xs text-muted-foreground">El documento de identidad no puede ser modificado</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="bg-transparent"
                onClick={() => router.push(mode === "edit" && customerId ? `/clients/${customerId}` : "/clients")}
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
                    {mode === "create" ? "Crear Cliente" : "Guardar Cambios"}
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

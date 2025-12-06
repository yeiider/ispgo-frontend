"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, CreditCard, DollarSign, AlertCircle, ArrowDown, ArrowUp, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { createPlan } from "@/app/actions/plans"

export function PlanNewForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    monthly_price: "",
    download_speed: "",
    upload_speed: "",
    status: "active",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError("El nombre del plan es requerido")
      return
    }

    if (!formData.monthly_price || Number(formData.monthly_price) <= 0) {
      setError("El precio mensual debe ser mayor a 0")
      return
    }

    if (!formData.download_speed || Number(formData.download_speed) <= 0) {
      setError("La velocidad de descarga es requerida")
      return
    }

    if (!formData.upload_speed || Number(formData.upload_speed) <= 0) {
      setError("La velocidad de subida es requerida")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const result = await createPlan({
        name: formData.name,
        monthly_price: Number(formData.monthly_price),
        download_speed: Number(formData.download_speed),
        upload_speed: Number(formData.upload_speed),
        status: formData.status,
      })
      if (result.success && result.data) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/plans/${result.data!.id}`)
        }, 1500)
      } else {
        setError(result.error || "Error al crear el plan")
      }
    } catch (err) {
      setError("Error al crear el plan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="gap-2 -ml-2">
          <Link href="/plans">
            <ArrowLeft className="h-4 w-4" />
            Planes
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Nuevo Plan
          </h1>
          <p className="text-sm text-muted-foreground">Crea un nuevo plan de internet</p>
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
          <AlertDescription>Plan creado correctamente. Redirigiendo...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Información del Plan
            </CardTitle>
            <CardDescription>Configura los detalles del nuevo plan de internet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Plan *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Plan Básico 50MB"
                className="bg-secondary/50"
              />
              <p className="text-xs text-muted-foreground">Nombre descriptivo que identifica el plan</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="monthly_price" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Precio Mensual (COP) *
                </Label>
                <Input
                  id="monthly_price"
                  type="number"
                  value={formData.monthly_price}
                  onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                  placeholder="50000"
                  min="0"
                  step="1000"
                  className="bg-secondary/50"
                />
                <p className="text-xs text-muted-foreground">Valor en pesos colombianos</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado Inicial</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Estado del plan al crearlo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              Velocidades
            </CardTitle>
            <CardDescription>Configura las velocidades de descarga y subida en MB</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="download_speed" className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-accent" />
                  Velocidad de Descarga (MB) *
                </Label>
                <Input
                  id="download_speed"
                  type="number"
                  value={formData.download_speed}
                  onChange={(e) => setFormData({ ...formData, download_speed: e.target.value })}
                  placeholder="50"
                  min="0"
                  className="bg-secondary/50"
                />
                <p className="text-xs text-muted-foreground">Velocidad de bajada en megabits</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload_speed" className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-primary" />
                  Velocidad de Subida (MB) *
                </Label>
                <Input
                  id="upload_speed"
                  type="number"
                  value={formData.upload_speed}
                  onChange={(e) => setFormData({ ...formData, upload_speed: e.target.value })}
                  placeholder="25"
                  min="0"
                  className="bg-secondary/50"
                />
                <p className="text-xs text-muted-foreground">Velocidad de subida en megabits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/plans">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Crear Plan
          </Button>
        </div>
      </form>
    </div>
  )
}

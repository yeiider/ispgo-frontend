"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import type { Plan } from "@/lib/graphql/types"
import { getPlan, updatePlan } from "@/app/actions/plans"

interface PlanEditFormProps {
  planId: string
}

export function PlanEditForm({ planId }: PlanEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    monthly_price: "",
    download_speed: "",
    upload_speed: "",
    status: "active",
  })

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const result = await getPlan(planId)
        if (result.success && result.data) {
          setPlan(result.data)
          setFormData({
            name: result.data.name || "",
            monthly_price: result.data.monthly_price?.toString() || "",
            download_speed: result.data.download_speed?.toString() || "",
            upload_speed: result.data.upload_speed?.toString() || "",
            status: result.data.status || "active",
          })
        }
      } catch (err) {
        console.error("Error fetching plan:", err)
        setError("Error al cargar el plan")
      } finally {
        setLoading(false)
      }
    }
    fetchPlan()
  }, [planId])

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

    setSaving(true)
    setError(null)

    try {
      const result = await updatePlan({
        id: planId,
        name: formData.name,
        monthly_price: Number(formData.monthly_price),
        download_speed: formData.download_speed ? Number(formData.download_speed) : undefined,
        upload_speed: formData.upload_speed ? Number(formData.upload_speed) : undefined,
        status: formData.status,
      })
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/plans/${planId}`)
        }, 1500)
      } else {
        setError(result.error || "Error al actualizar el plan")
      }
    } catch (err) {
      setError("Error al actualizar el plan")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">Plan no encontrado</p>
        <Button asChild className="mt-4">
          <Link href="/plans">Volver a Planes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="gap-2 -ml-2">
          <Link href={`/plans/${planId}`}>
            <ArrowLeft className="h-4 w-4" />
            Detalle
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Editar Plan
          </h1>
          <p className="text-sm text-muted-foreground">Modifica los datos del plan #{planId}</p>
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
          <AlertDescription>Plan actualizado correctamente. Redirigiendo...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Información del Plan
            </CardTitle>
            <CardDescription>Modifica los detalles del plan de internet</CardDescription>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
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
                  Velocidad de Descarga (MB)
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload_speed" className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-primary" />
                  Velocidad de Subida (MB)
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/plans/${planId}`}>Cancelar</Link>
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

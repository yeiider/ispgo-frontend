"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Server, AlertCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { createRouter } from "@/app/actions/routers"

export function RouterNewForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const result = await createRouter({
        name: formData.name,
      })
      if (result.success && result.data) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/routers/${result.data!.id}`)
        }, 1500)
      } else {
        setError(result.error || "Error al crear el router")
      }
    } catch (err) {
      setError("Error al crear el router")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href="/routers">
              <ArrowLeft className="h-4 w-4" />
              Routers
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Plus className="h-6 w-6 text-primary" />
              Nuevo Router
            </h1>
            <p className="text-sm text-muted-foreground">Registra un nuevo router en el sistema</p>
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
          <AlertDescription>Router creado correctamente. Redirigiendo...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Informacion del Router
            </CardTitle>
            <CardDescription>Datos de configuracion del equipo de red</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Nombre del Router *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Router-Principal"
                required
                className="bg-secondary/50"
              />
              <p className="text-xs text-muted-foreground">Nombre identificativo del router (ej: Router-ZonaNorte)</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/routers">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Crear Router
          </Button>
        </div>
      </form>
    </div>
  )
}

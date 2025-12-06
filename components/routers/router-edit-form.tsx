"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Server, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import type { Router as RouterType } from "@/lib/graphql/types"
import { getRouter, updateRouter } from "@/app/actions/routers"

interface RouterEditFormProps {
  routerId: string
}

export function RouterEditForm({ routerId }: RouterEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [routerData, setRouterData] = useState<RouterType | null>(null)

  const [formData, setFormData] = useState({
    name: "",
  })

  useEffect(() => {
    const fetchRouter = async () => {
      try {
        const result = await getRouter(routerId)
        if (result.success && result.data) {
          setRouterData(result.data)
          setFormData({
            name: result.data.name || "",
          })
        }
      } catch (err) {
        setError("Error al cargar el router")
      } finally {
        setLoading(false)
      }
    }
    fetchRouter()
  }, [routerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const result = await updateRouter({
        id: routerId,
        name: formData.name || undefined,
      })
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/routers/${routerId}`)
        }, 1500)
      } else {
        setError(result.error || "Error al actualizar el router")
      }
    } catch (err) {
      setError("Error al actualizar el router")
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

  if (!routerData) {
    return (
      <div className="text-center py-12">
        <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">Router no encontrado</p>
        <Button asChild className="mt-4">
          <Link href="/routers">Volver a Routers</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href={`/routers/${routerId}`}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Server className="h-6 w-6 text-primary" />
              Editar Router
            </h1>
            <p className="text-sm text-muted-foreground">
              {routerData.name} - #{routerData.id}
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

      {success && (
        <Alert className="bg-accent/10 border-accent/30 text-accent">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Router actualizado correctamente. Redirigiendo...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Informacion del Router
            </CardTitle>
            <CardDescription>Modifica los datos del equipo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Nombre del Router
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Router-Principal"
                className="bg-secondary/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/routers/${routerId}`}>Cancelar</Link>
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

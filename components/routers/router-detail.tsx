"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Pencil, Server, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Router } from "@/lib/graphql/types"
import { getRouter } from "@/app/actions/routers"

interface RouterDetailProps {
  routerId: string
}

export function RouterDetail({ routerId }: RouterDetailProps) {
  const [router, setRouter] = useState<Router | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRouter = async () => {
      try {
        const result = await getRouter(routerId)
        if (result.success && result.data) {
          setRouter(result.data)
        }
      } catch (error) {
        console.error("Error fetching router:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRouter()
  }, [routerId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!router) {
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
    <div className="space-y-6">
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Server className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{router.name}</h1>
              <p className="text-sm text-muted-foreground">ID: #{router.id}</p>
            </div>
          </div>
        </div>
        <Button asChild className="gap-2">
          <Link href={`/routers/${router.id}/edit`}>
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      {/* Router Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Informacion del Router
          </CardTitle>
          <CardDescription>Detalles del equipo de red</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">ID</p>
              <p className="font-mono text-lg">#{router.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Server className="h-4 w-4" />
                Nombre
              </p>
              <p className="font-medium text-lg">{router.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

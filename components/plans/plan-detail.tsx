"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowDown,
  ArrowUp,
  Gauge,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Plan } from "@/lib/graphql/types"
import { getPlan, deletePlan } from "@/app/actions/plans"

interface PlanDetailProps {
  planId: string
}

export function PlanDetail({ planId }: PlanDetailProps) {
  const router = useRouter()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const result = await getPlan(planId)
        if (result.success && result.data) {
          setPlan(result.data)
        }
      } catch (error) {
        console.error("Error fetching plan:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlan()
  }, [planId])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const result = await deletePlan(planId)
      if (result.success) {
        router.push("/plans")
      }
    } catch (error) {
      console.error("Error deleting plan:", error)
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-accent/20 text-accent border-0 text-sm px-3 py-1">
            <CheckCircle className="h-4 w-4 mr-1" />
            Activo
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-muted text-muted-foreground border-0 text-sm px-3 py-1">
            <XCircle className="h-4 w-4 mr-1" />
            Inactivo
          </Badge>
        )
      default:
        return <Badge variant="outline">{status || "N/A"}</Badge>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href="/plans">
              <ArrowLeft className="h-4 w-4" />
              Planes
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-10" />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{plan.name}</h1>
                <p className="text-sm text-muted-foreground">ID: #{plan.id}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2 bg-transparent">
            <Link href={`/plans/${planId}/edit`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" className="gap-2" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Plan Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Información del Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Nombre del Plan</p>
                <p className="font-medium text-lg">{plan.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Estado</p>
                <div>{getStatusBadge(plan.status)}</div>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Velocidades
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <ArrowDown className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Descarga</p>
                    <p className="text-2xl font-bold text-accent">{plan.download_speed || 0} MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <ArrowUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subida</p>
                    <p className="text-2xl font-bold text-primary">{plan.upload_speed || 0} MB</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" />
              Precio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-accent">{formatCurrency(plan.monthly_price)}</p>
              <p className="text-sm text-muted-foreground mt-2">por mes</p>
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio Anual</span>
                <span className="font-medium">{formatCurrency(plan.monthly_price * 12)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio Diario</span>
                <span className="font-medium">{formatCurrency(plan.monthly_price / 30)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente el plan{" "}
              <span className="font-semibold">{plan.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

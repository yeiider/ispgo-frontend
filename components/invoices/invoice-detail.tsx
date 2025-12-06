"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FileText,
  User,
  Calendar,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Printer,
  Mail,
  Download,
  DollarSign,
  Wifi,
  CreditCard,
  Percent,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Invoice } from "@/lib/graphql/types"
import { getInvoice } from "@/app/actions/invoices"
import { RegisterPaymentDialog } from "@/components/actions/register-payment-dialog"
import { ApplyDiscountDialog } from "@/components/actions/apply-discount-dialog"
import { PaymentPromiseDialog } from "@/components/actions/payment-promise-dialog"

const statusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: "Pagada", color: "bg-accent/20 text-accent border-accent/30" },
  pending: { label: "Pendiente", color: "bg-warning/20 text-warning border-warning/30" },
  overdue: { label: "Vencida", color: "bg-destructive/20 text-destructive border-destructive/30" },
  cancelled: { label: "Cancelada", color: "bg-muted/50 text-muted-foreground border-muted" },
}

interface InvoiceDetailProps {
  invoiceId: string
}

export function InvoiceDetail({ invoiceId }: InvoiceDetailProps) {
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoice = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getInvoice(invoiceId)
      if (result.success && result.data) {
        setInvoice(result.data)
      } else {
        setError(result.error || "Error al cargar la factura")
      }
    } catch (err) {
      setError("Error al cargar la factura")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  const getStatusConfig = (status?: string) => {
    return statusConfig[status || "pending"] || statusConfig.pending
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount)
  }

  const handleActionSuccess = () => {
    fetchInvoice()
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          Cargando factura...
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/billing/invoices">
            <ArrowLeft className="h-4 w-4" />
            Volver a facturas
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Factura no encontrada"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const status = getStatusConfig(invoice.status)
  const isPaid = invoice.status === "paid"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href="/billing/invoices">
              <ArrowLeft className="h-4 w-4" />
              Facturas
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Factura #{invoice.increment_id || invoice.id}
              </h1>
              <Badge variant="outline" className={status.color}>
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Emitida el{" "}
              {invoice.issue_date
                ? new Date(invoice.issue_date).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : new Date(invoice.created_at).toLocaleDateString("es-ES")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Mail className="h-4 w-4" />
            Enviar
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            PDF
          </Button>

          {!isPaid && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  Acciones
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <RegisterPaymentDialog
                  invoiceId={invoice.id}
                  invoiceNumber={invoice.increment_id}
                  total={invoice.total}
                  onSuccess={handleActionSuccess}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer">
                      <DollarSign className="h-4 w-4" />
                      Registrar Pago
                    </DropdownMenuItem>
                  }
                />
                <ApplyDiscountDialog
                  invoiceId={invoice.id}
                  invoiceNumber={invoice.increment_id}
                  total={invoice.total}
                  onSuccess={handleActionSuccess}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer">
                      <Percent className="h-4 w-4" />
                      Aplicar Descuento
                    </DropdownMenuItem>
                  }
                />
                <DropdownMenuSeparator />
                <PaymentPromiseDialog
                  invoiceId={invoice.id}
                  invoiceNumber={invoice.increment_id}
                  total={invoice.total}
                  onSuccess={handleActionSuccess}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer">
                      <Clock className="h-4 w-4" />
                      Promesa de Pago
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount Summary */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between p-6 rounded-lg bg-primary/5 border border-primary/20">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total a Pagar</p>
                  <p className="text-4xl font-bold text-foreground">{formatCurrency(invoice.total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Vencimiento</p>
                  <p className="text-lg font-medium">
                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("es-ES") : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Detalle de la Factura</CardTitle>
              <CardDescription>Conceptos facturados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Descripción</th>
                      <th className="p-3 text-center text-xs font-medium text-muted-foreground uppercase">Cantidad</th>
                      <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase">
                        Precio Unit.
                      </th>
                      <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item) => (
                        <tr key={item.id} className="border-b border-border">
                          <td className="p-3">
                            <p className="font-medium">{item.description || "Servicio de internet"}</p>
                          </td>
                          <td className="p-3 text-center">{item.quantity || 1}</td>
                          <td className="p-3 text-right font-mono">{formatCurrency(item.unit_price || 0)}</td>
                          <td className="p-3 text-right font-mono font-medium">{formatCurrency(item.subtotal || 0)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b border-border">
                        <td className="p-3">
                          <p className="font-medium">Servicio de Internet</p>
                          <p className="text-sm text-muted-foreground">Periodo mensual</p>
                        </td>
                        <td className="p-3 text-center">1</td>
                        <td className="p-3 text-right font-mono">{formatCurrency(invoice.total)}</td>
                        <td className="p-3 text-right font-mono font-medium">{formatCurrency(invoice.total)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30">
                      <td colSpan={3} className="p-3 text-right font-medium">
                        Total
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-lg">{formatCurrency(invoice.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Adjustments */}
          {invoice.adjustments && invoice.adjustments.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Ajustes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {invoice.adjustments.map((adj) => (
                    <div key={adj.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div>
                        <p className="font-medium">{adj.label || adj.kind}</p>
                        <p className="text-sm text-muted-foreground">{adj.kind}</p>
                      </div>
                      <span className={`font-mono font-medium ${adj.amount < 0 ? "text-destructive" : "text-accent"}`}>
                        {adj.amount < 0 ? "-" : "+"}
                        {formatCurrency(Math.abs(adj.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice.customer ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <Link
                        href={`/clients/${invoice.customer.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {invoice.customer.first_name} {invoice.customer.last_name}
                      </Link>
                      <p className="text-sm text-muted-foreground">{invoice.customer.email_address || "-"}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Documento</p>
                    <p className="font-mono">{invoice.customer.identity_document || "-"}</p>
                  </div>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href={`/clients/${invoice.customer.id}`}>Ver perfil</Link>
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">Sin cliente asignado</p>
              )}
            </CardContent>
          </Card>

          {/* Service Info */}
          {invoice.service && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-primary" />
                  Servicio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="font-medium">{invoice.service.plan?.name || "Servicio"}</p>
                  <p className="text-sm text-muted-foreground font-mono">IP: {invoice.service.service_ip || "-"}</p>
                </div>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href={`/services/${invoice.service.id}`}>Ver servicio</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Fecha de Emisión</p>
                <p className="font-medium">
                  {invoice.issue_date
                    ? new Date(invoice.issue_date).toLocaleDateString("es-ES")
                    : new Date(invoice.created_at).toLocaleDateString("es-ES")}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                <p className="font-medium">
                  {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("es-ES") : "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Promises */}
          {invoice.paymentPromises && invoice.paymentPromises.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Promesas de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.paymentPromises.map((promise) => (
                    <div key={promise.id} className="p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{formatCurrency(promise.amount)}</span>
                        <Badge variant="outline" className="text-xs">
                          {promise.status || "pendiente"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Fecha: {promise.promise_date ? new Date(promise.promise_date).toLocaleDateString("es-ES") : "-"}
                      </p>
                      {promise.notes && <p className="text-sm text-muted-foreground mt-1">{promise.notes}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!isPaid && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <RegisterPaymentDialog
                  invoiceId={invoice.id}
                  invoiceNumber={invoice.increment_id}
                  total={invoice.total}
                  onSuccess={handleActionSuccess}
                  trigger={
                    <Button className="w-full gap-2">
                      <DollarSign className="h-4 w-4" />
                      Registrar Pago
                    </Button>
                  }
                />
                <ApplyDiscountDialog
                  invoiceId={invoice.id}
                  invoiceNumber={invoice.increment_id}
                  total={invoice.total}
                  onSuccess={handleActionSuccess}
                  trigger={
                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      <Percent className="h-4 w-4" />
                      Aplicar Descuento
                    </Button>
                  }
                />
                <PaymentPromiseDialog
                  invoiceId={invoice.id}
                  invoiceNumber={invoice.increment_id}
                  total={invoice.total}
                  onSuccess={handleActionSuccess}
                  trigger={
                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      <Clock className="h-4 w-4" />
                      Promesa de Pago
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

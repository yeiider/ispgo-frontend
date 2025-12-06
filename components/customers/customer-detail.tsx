"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  Wifi,
  FileText,
  CreditCard,
  Activity,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Customer } from "@/lib/graphql/types"
import { getCustomer, deleteCustomer } from "@/app/actions/customers"
import { GenerateInvoiceDialog } from "@/components/actions/generate-invoice-dialog"
import { UpdateCustomerStatusDialog } from "@/components/actions/update-customer-status-dialog"

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Activo", color: "bg-accent/20 text-accent border-accent/30" },
  inactive: { label: "Inactivo", color: "bg-muted/50 text-muted-foreground border-muted" },
  suspended: { label: "Suspendido", color: "bg-warning/20 text-warning border-warning/30" },
  pending: { label: "Pendiente", color: "bg-primary/20 text-primary border-primary/30" },
}

const serviceStatusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Activo", color: "bg-accent/20 text-accent border-accent/30" },
  suspended: { label: "Suspendido", color: "bg-warning/20 text-warning border-warning/30" },
  cancelled: { label: "Cancelado", color: "bg-destructive/20 text-destructive border-destructive/30" },
}

const invoiceStatusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: "Pagada", color: "bg-accent/20 text-accent border-accent/30" },
  pending: { label: "Pendiente", color: "bg-warning/20 text-warning border-warning/30" },
  overdue: { label: "Vencida", color: "bg-destructive/20 text-destructive border-destructive/30" },
}

interface CustomerDetailProps {
  customerId: string
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchCustomer = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getCustomer(customerId)
      if (result.success && result.data) {
        setCustomer(result.data)
      } else {
        setError(result.error || "Error al cargar el cliente")
      }
    } catch (err) {
      setError("Error al cargar el cliente")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomer()
  }, [customerId])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const result = await deleteCustomer(customerId)
      if (result.success) {
        router.push("/clients")
      } else {
        setError(result.error || "Error al eliminar el cliente")
      }
    } catch (err) {
      setError("Error al eliminar el cliente")
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const getStatusConfig = (status?: string) => {
    return statusConfig[status || "active"] || statusConfig.active
  }

  const handleActionSuccess = () => {
    fetchCustomer()
    router.refresh()
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

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
            Volver a clientes
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Cliente no encontrado"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="gap-2 -ml-2">
              <Link href="/clients">
                <ArrowLeft className="h-4 w-4" />
                Clientes
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {customer.first_name} {customer.last_name}
                </h1>
                <Badge variant="outline" className={getStatusConfig(customer.customer_status).color}>
                  {getStatusConfig(customer.customer_status).label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                ID: #{customer.id} · Creado el {new Date(customer.created_at).toLocaleDateString("es-ES")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <GenerateInvoiceDialog
              customerId={customerId}
              customerName={`${customer.first_name} ${customer.last_name}`}
              services={customer.services}
              onSuccess={handleActionSuccess}
            />
            <UpdateCustomerStatusDialog
              customerId={customerId}
              customerName={`${customer.first_name} ${customer.last_name}`}
              currentStatus={customer.customer_status}
              onSuccess={handleActionSuccess}
            />
            <Button variant="outline" asChild className="gap-2 bg-transparent">
              <Link href={`/clients/${customerId}/edit`}>
                <Edit className="h-4 w-4" />
                Editar
              </Link>
            </Button>
            <Button
              variant="outline"
              className="gap-2 bg-transparent text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-card">
              <User className="h-4 w-4" />
              Información General
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2 data-[state=active]:bg-card">
              <Wifi className="h-4 w-4" />
              Servicios ({customer.services?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2 data-[state=active]:bg-card">
              <FileText className="h-4 w-4" />
              Facturas ({customer.invoices?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2 data-[state=active]:bg-card">
              <Activity className="h-4 w-4" />
              Actividad
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Info */}
              <Card className="bg-card border-border lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Datos Personales
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nombre Completo</p>
                    <p className="font-medium">
                      {customer.first_name} {customer.last_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Documento de Identidad</p>
                    <p className="font-mono">{customer.identity_document || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </p>
                    <p className="font-medium">{customer.email_address || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono
                    </p>
                    <p className="font-medium">{customer.phone_number || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Registro
                    </p>
                    <p className="font-medium">{new Date(customer.created_at).toLocaleDateString("es-ES")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Última Actualización</p>
                    <p className="font-medium">{new Date(customer.updated_at).toLocaleDateString("es-ES")}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Resumen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-primary" />
                      <span className="text-sm">Servicios Activos</span>
                    </div>
                    <span className="font-bold text-lg">
                      {customer.services?.filter((s) => s.service_status === "active").length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-warning" />
                      <span className="text-sm">Facturas Pendientes</span>
                    </div>
                    <span className="font-bold text-lg">
                      {customer.invoices?.filter((i) => i.status === "pending").length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-accent" />
                      <span className="text-sm">Total Facturado</span>
                    </div>
                    <span className="font-bold text-lg">
                      ${customer.invoices?.reduce((sum, inv) => sum + inv.total, 0).toLocaleString() || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Addresses */}
            {customer.addresses && customer.addresses.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Direcciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customer.addresses.map((address) => (
                      <div key={address.id} className="p-4 rounded-lg bg-secondary/30 border border-border">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{address.address}</p>
                            <p className="text-sm text-muted-foreground">
                              {[address.city, address.state_province, address.postal_code].filter(Boolean).join(", ")}
                            </p>
                            {address.country && <p className="text-sm text-muted-foreground">{address.country}</p>}
                          </div>
                          {address.address_type && (
                            <Badge variant="secondary" className="text-xs">
                              {address.address_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Servicios Contratados</CardTitle>
                  <CardDescription>Historial de servicios del cliente</CardDescription>
                </div>
                <Button asChild size="sm" className="gap-2">
                  <Link href={`/services/new?customer=${customerId}`}>
                    <Wifi className="h-4 w-4" />
                    Nuevo Servicio
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {customer.services && customer.services.length > 0 ? (
                  <div className="space-y-4">
                    {customer.services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Wifi className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{service.plan?.name || "Sin plan"}</p>
                              <Badge
                                variant="outline"
                                className={
                                  serviceStatusConfig[service.service_status || "active"]?.color ||
                                  serviceStatusConfig.active.color
                                }
                              >
                                {serviceStatusConfig[service.service_status || "active"]?.label || "Activo"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {service.service_ip || "-"}
                              </span>
                              {service.activation_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(service.activation_date).toLocaleDateString("es-ES")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {service.plan?.monthly_price && (
                            <span className="font-bold text-lg">${service.plan.monthly_price}/mes</span>
                          )}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/services/${service.id}`}>Ver detalle</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay servicios registrados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Historial de Facturas</CardTitle>
                  <CardDescription>Todas las facturas del cliente</CardDescription>
                </div>
                <GenerateInvoiceDialog
                  customerId={customerId}
                  customerName={`${customer.first_name} ${customer.last_name}`}
                  services={customer.services}
                  onSuccess={handleActionSuccess}
                />
              </CardHeader>
              <CardContent>
                {customer.invoices && customer.invoices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Factura</th>
                          <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Fecha Emisión
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Vencimiento
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Estado</th>
                          <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase">Total</th>
                          <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {customer.invoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b border-border hover:bg-muted/30">
                            <td className="p-3">
                              <span className="font-mono text-primary">{invoice.increment_id || `#${invoice.id}`}</span>
                            </td>
                            <td className="p-3 text-sm">
                              {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString("es-ES") : "-"}
                            </td>
                            <td className="p-3 text-sm">
                              {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("es-ES") : "-"}
                            </td>
                            <td className="p-3">
                              <Badge
                                variant="outline"
                                className={
                                  invoiceStatusConfig[invoice.status]?.color || invoiceStatusConfig.pending.color
                                }
                              >
                                {invoiceStatusConfig[invoice.status]?.label || invoice.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-right font-mono font-medium">${invoice.total.toLocaleString()}</td>
                            <td className="p-3 text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/billing/invoices/${invoice.id}`}>Ver</Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay facturas registradas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Historial de Actividad</CardTitle>
                <CardDescription>Eventos y acciones recientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay actividad reciente registrada</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente{" "}
              <strong>
                {customer.first_name} {customer.last_name}
              </strong>{" "}
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

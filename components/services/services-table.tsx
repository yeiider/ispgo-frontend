"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Eye,
  Edit,
  FileSpreadsheet,
  FileText,
  Wifi,
  RefreshCw,
  Loader2,
  Globe,
  User,
  Play,
  Pause,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { Service } from "@/lib/graphql/types"
import { getServices } from "@/app/actions/services"
import { activateService, suspendService } from "@/app/actions/service-actions"
import { useToast } from "@/hooks/use-toast"

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Activo", color: "bg-accent/20 text-accent border-accent/30" },
  suspended: { label: "Suspendido", color: "bg-warning/20 text-warning border-warning/30" },
  cancelled: { label: "Cancelado", color: "bg-destructive/20 text-destructive border-destructive/30" },
  pending: { label: "Pendiente", color: "bg-primary/20 text-primary border-primary/30" },
}

type SortField = "customer" | "plan" | "status" | "ip" | "created_at"
type SortOrder = "asc" | "desc"

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function ServicesTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("customer")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const debouncedSearch = useDebounce(search, 400)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const filters = {
        service_ip: debouncedSearch || undefined,
        sn: debouncedSearch || undefined,
        service_status: statusFilter !== "all" ? statusFilter : undefined,
      }

      const result = await getServices(currentPage, pageSize, filters)
      if (result.success && result.data) {
        setServices(result.data.data)
        setTotalPages(result.data.paginatorInfo.lastPage)
        setTotalItems(result.data.paginatorInfo.total)
      }
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const handleActivateService = async (serviceId: string) => {
    setActionLoading(serviceId)
    try {
      const result = await activateService(serviceId)
      if (result.success) {
        toast({
          title: "Servicio activado",
          description: result.message || "El servicio se ha activado exitosamente",
        })
        fetchServices()
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo activar el servicio",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al activar el servicio",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspendService = async (serviceId: string) => {
    setActionLoading(serviceId)
    try {
      const result = await suspendService(serviceId)
      if (result.success) {
        toast({
          title: "Servicio suspendido",
          description: result.message || "El servicio se ha suspendido exitosamente",
        })
        fetchServices()
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo suspender el servicio",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al suspender el servicio",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const sortedServices = [...services].sort((a, b) => {
    let aValue = ""
    let bValue = ""

    switch (sortField) {
      case "customer":
        aValue = `${a.customer?.first_name || ""} ${a.customer?.last_name || ""}`
        bValue = `${b.customer?.first_name || ""} ${b.customer?.last_name || ""}`
        break
      case "plan":
        aValue = a.plan?.name || ""
        bValue = b.plan?.name || ""
        break
      case "status":
        aValue = a.service_status || ""
        bValue = b.service_status || ""
        break
      case "ip":
        aValue = a.service_ip || ""
        bValue = b.service_ip || ""
        break
      case "created_at":
        aValue = a.created_at
        bValue = b.created_at
        break
    }

    const order = sortOrder === "asc" ? 1 : -1
    return aValue.localeCompare(bValue) * order
  })

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const toggleSelectAll = () => {
    if (selectedRows.length === sortedServices.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(sortedServices.map((s) => s.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const getStatusConfig = (status?: string) => {
    return statusConfig[status || "active"] || statusConfig.active
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Gestión de Servicios</CardTitle>
            <Badge variant="secondary" className="font-mono">
              {totalItems} total
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por IP, serial..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50"
              />
              {loading && search && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-secondary/50">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="bg-transparent" onClick={fetchServices} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar a Excel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar a PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/services/new">
                <Wifi className="h-4 w-4" />
                Nuevo Servicio
              </Link>
            </Button>
          </div>
        </div>

        {(search || statusFilter !== "all" || selectedRows.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 pt-3">
            {selectedRows.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                {selectedRows.length} seleccionados
                <button onClick={() => setSelectedRows([])} className="ml-1 hover:text-foreground">
                  ×
                </button>
              </Badge>
            )}
            {search && (
              <Badge variant="secondary" className="gap-1">
                Búsqueda: {search}
                <button onClick={() => setSearch("")} className="ml-1 hover:text-foreground">
                  ×
                </button>
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Estado: {getStatusConfig(statusFilter).label}
                <button onClick={() => setStatusFilter("all")} className="ml-1 hover:text-foreground">
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y border-border bg-muted/30">
                <th className="p-3 text-left w-10">
                  <Checkbox
                    checked={selectedRows.length === sortedServices.length && sortedServices.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                <th
                  className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("customer")}
                >
                  <div className="flex items-center gap-1">
                    Cliente
                    <SortIcon field="customer" />
                  </div>
                </th>
                <th
                  className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("plan")}
                >
                  <div className="flex items-center gap-1">
                    Plan
                    <SortIcon field="plan" />
                  </div>
                </th>
                <th
                  className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("ip")}
                >
                  <div className="flex items-center gap-1">
                    IP
                    <SortIcon field="ip" />
                  </div>
                </th>
                <th
                  className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Estado
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Precio
                </th>
                <th
                  className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("created_at")}
                >
                  <div className="flex items-center gap-1">
                    Activación
                    <SortIcon field="created_at" />
                  </div>
                </th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Cargando servicios...
                    </div>
                  </td>
                </tr>
              ) : sortedServices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    No se encontraron servicios
                  </td>
                </tr>
              ) : (
                sortedServices.map((service) => (
                  <tr
                    key={service.id}
                    className={cn(
                      "border-b border-border transition-colors hover:bg-muted/30",
                      selectedRows.includes(service.id) && "bg-primary/5",
                    )}
                  >
                    <td className="p-3">
                      <Checkbox
                        checked={selectedRows.includes(service.id)}
                        onCheckedChange={() => toggleSelectRow(service.id)}
                      />
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-sm text-primary">#{service.id}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          {service.customer ? (
                            <Link
                              href={`/clients/${service.customer.id}`}
                              className="font-medium text-foreground hover:text-primary transition-colors"
                            >
                              {service.customer.first_name} {service.customer.last_name}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">Sin cliente</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {service.customer?.email_address || "-"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-primary" />
                        <span className="text-sm">{service.plan?.name || "Sin plan"}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-sm">{service.service_ip || "-"}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={getStatusConfig(service.service_status).color}>
                        {getStatusConfig(service.service_status).label}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">
                        {service.plan?.monthly_price ? `$${service.plan.monthly_price}` : "-"}
                      </span>
                      {service.plan?.monthly_price && <span className="text-xs text-muted-foreground">/mes</span>}
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-muted-foreground">
                        {service.activation_date
                          ? new Date(service.activation_date).toLocaleDateString("es-ES")
                          : new Date(service.created_at).toLocaleDateString("es-ES")}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={actionLoading === service.id}
                          >
                            {actionLoading === service.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/services/${service.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalle
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/services/${service.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {service.service_status !== "active" && (
                            <DropdownMenuItem
                              onClick={() => handleActivateService(service.id)}
                              className="text-accent cursor-pointer"
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Activar Servicio
                            </DropdownMenuItem>
                          )}
                          {service.service_status === "active" && (
                            <DropdownMenuItem
                              onClick={() => handleSuspendService(service.id)}
                              className="text-warning cursor-pointer"
                            >
                              <Pause className="mr-2 h-4 w-4" />
                              Suspender Servicio
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Mostrando</span>
            <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>de {totalItems} resultados</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Página {currentPage} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

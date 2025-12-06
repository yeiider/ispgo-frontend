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
  Trash2,
  FileSpreadsheet,
  FileText,
  UserPlus,
  RefreshCw,
  Loader2,
  UserCog,
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
import { cn } from "@/lib/utils"
import type { Customer } from "@/lib/graphql/types"
import { getCustomers, deleteCustomer } from "@/app/actions/customers"
import { GenerateInvoiceDialog } from "@/components/actions/generate-invoice-dialog"
import { UpdateCustomerStatusDialog } from "@/components/actions/update-customer-status-dialog"

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Activo", color: "bg-accent/20 text-accent border-accent/30" },
  inactive: { label: "Inactivo", color: "bg-muted/50 text-muted-foreground border-muted" },
  suspended: { label: "Suspendido", color: "bg-warning/20 text-warning border-warning/30" },
  pending: { label: "Pendiente", color: "bg-primary/20 text-primary border-primary/30" },
}

type SortField = "name" | "email" | "status" | "created_at"
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

export function CustomersTable() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState(false)

  const debouncedSearch = useDebounce(search, 400)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const filters = {
        search: debouncedSearch || undefined,
        customer_status: statusFilter !== "all" ? statusFilter : undefined,
      }

      const result = await getCustomers(currentPage, pageSize, filters)
      if (result.success && result.data) {
        setCustomers(result.data.data)
        setTotalPages(result.data.paginatorInfo.lastPage)
        setTotalItems(result.data.paginatorInfo.total)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const sortedCustomers = [...customers].sort((a, b) => {
    let aValue: string | number = ""
    let bValue: string | number = ""

    switch (sortField) {
      case "name":
        aValue = `${a.first_name} ${a.last_name}`
        bValue = `${b.first_name} ${b.last_name}`
        break
      case "email":
        aValue = a.email_address || ""
        bValue = b.email_address || ""
        break
      case "status":
        aValue = a.customer_status || ""
        bValue = b.customer_status || ""
        break
      case "created_at":
        aValue = a.created_at
        bValue = b.created_at
        break
    }

    const order = sortOrder === "asc" ? 1 : -1
    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * order
    }
    return 0
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
    if (selectedRows.length === sortedCustomers.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(sortedCustomers.map((c) => c.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  const handleDelete = async () => {
    if (!customerToDelete) return
    setDeleting(true)
    try {
      const result = await deleteCustomer(customerToDelete.id)
      if (result.success) {
        await fetchCustomers()
      }
    } catch (error) {
      console.error("Error deleting customer:", error)
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setCustomerToDelete(null)
    }
  }

  const handleActionSuccess = useCallback(() => {
    fetchCustomers()
    router.refresh()
  }, [fetchCustomers, router])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const getStatusConfig = (status?: string) => {
    return statusConfig[status || "active"] || statusConfig.active
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">Gestión de Clientes</CardTitle>
              <Badge variant="secondary" className="font-mono">
                {totalItems} total
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email, documento..."
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
                  <SelectItem value="inactive">Inactivos</SelectItem>
                  <SelectItem value="suspended">Suspendidos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                className="bg-transparent"
                onClick={fetchCustomers}
                disabled={loading}
              >
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
                <Link href="/clients/new">
                  <UserPlus className="h-4 w-4" />
                  Nuevo Cliente
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
                      checked={selectedRows.length === sortedCustomers.length && sortedCustomers.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    ID
                  </th>
                  <th
                    className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Cliente
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Servicios
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
                  <th
                    className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("created_at")}
                  >
                    <div className="flex items-center gap-1">
                      Creado
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
                    <td colSpan={8} className="p-8 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Cargando clientes...
                      </div>
                    </td>
                  </tr>
                ) : sortedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No se encontraron clientes
                    </td>
                  </tr>
                ) : (
                  sortedCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-muted/30",
                        selectedRows.includes(customer.id) && "bg-primary/5",
                      )}
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={selectedRows.includes(customer.id)}
                          onCheckedChange={() => toggleSelectRow(customer.id)}
                        />
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-sm text-primary">#{customer.id}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <Link
                            href={`/clients/${customer.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {customer.first_name} {customer.last_name}
                          </Link>
                          <span className="text-xs text-muted-foreground">{customer.email_address || "Sin email"}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-sm text-muted-foreground">
                          {customer.identity_document || "-"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {customer.services?.length || 0} servicios
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={getStatusConfig(customer.customer_status).color}>
                          {getStatusConfig(customer.customer_status).label}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {new Date(customer.created_at).toLocaleDateString("es-ES")}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/clients/${customer.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalle
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/clients/${customer.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <GenerateInvoiceDialog
                              customerId={customer.id}
                              customerName={`${customer.first_name} ${customer.last_name}`}
                              services={customer.services}
                              onSuccess={handleActionSuccess}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                  <FileText className="mr-2 h-4 w-4" />
                                  Generar Factura
                                </DropdownMenuItem>
                              }
                            />
                            <UpdateCustomerStatusDialog
                              customerId={customer.id}
                              customerName={`${customer.first_name} ${customer.last_name}`}
                              currentStatus={customer.customer_status}
                              onSuccess={handleActionSuccess}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                  <UserCog className="mr-2 h-4 w-4" />
                                  Cambiar Estado
                                </DropdownMenuItem>
                              }
                            />
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setCustomerToDelete(customer)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente{" "}
              <strong>
                {customerToDelete?.first_name} {customerToDelete?.last_name}
              </strong>{" "}
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

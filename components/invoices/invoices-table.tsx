"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  Download,
  ChevronUp,
  ChevronDown,
  Eye,
  FileText,
  MoreHorizontal,
  DollarSign,
  Percent,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import type { Invoice } from "@/lib/graphql/types"
import { getInvoices } from "@/app/actions/invoices"
import { RegisterPaymentDialog } from "@/components/actions/register-payment-dialog"
import { ApplyDiscountDialog } from "@/components/actions/apply-discount-dialog"
import { PaymentPromiseDialog } from "@/components/actions/payment-promise-dialog"

const statusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: "Pagada", color: "bg-accent/20 text-accent border-accent/30" },
  pending: { label: "Pendiente", color: "bg-warning/20 text-warning border-warning/30" },
  overdue: { label: "Vencida", color: "bg-destructive/20 text-destructive border-destructive/30" },
  cancelled: { label: "Cancelada", color: "bg-muted/50 text-muted-foreground border-muted" },
}

type SortField = "increment_id" | "customer" | "total" | "status" | "due_date"
type SortOrder = "asc" | "desc"

export function InvoicesTable() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("due_date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const result = await getInvoices(currentPage, pageSize)
      if (result.success && result.data) {
        setInvoices(result.data.data || [])
        setTotalPages(result.data.paginatorInfo?.lastPage || 1)
        setTotalItems(result.data.paginatorInfo?.total || 0)
      } else {
        console.error("Error fetching invoices:", result.error)
        setInvoices([])
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [currentPage, pageSize])

  const handleActionSuccess = () => {
    fetchInvoices()
    router.refresh()
  }

  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = [...invoices]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (inv) =>
          inv.increment_id?.toString().includes(searchLower) ||
          inv.customer?.first_name?.toLowerCase().includes(searchLower) ||
          inv.customer?.last_name?.toLowerCase().includes(searchLower),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === statusFilter)
    }

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "increment_id":
          comparison = (a.increment_id || 0) - (b.increment_id || 0)
          break
        case "customer":
          const nameA = `${a.customer?.first_name || ""} ${a.customer?.last_name || ""}`
          const nameB = `${b.customer?.first_name || ""} ${b.customer?.last_name || ""}`
          comparison = nameA.localeCompare(nameB)
          break
        case "total":
          comparison = (a.total || 0) - (b.total || 0)
          break
        case "status":
          comparison = (a.status || "").localeCompare(b.status || "")
          break
        case "due_date":
          comparison = new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime()
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [invoices, search, statusFilter, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredAndSortedInvoices.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredAndSortedInvoices.map((inv) => inv.id))
    }
  }

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
      amount,
    )
  }

  const formatDate = (date: string) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border/50"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-card border-border/50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="paid">Pagadas</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="overdue">Vencidas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={
                      filteredAndSortedInvoices.length > 0 && selectedRows.length === filteredAndSortedInvoices.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("increment_id")}
                >
                  <div className="flex items-center gap-1">
                    Factura <SortIcon field="increment_id" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("customer")}
                >
                  <div className="flex items-center gap-1">
                    Cliente <SortIcon field="customer" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("total")}
                >
                  <div className="flex items-center gap-1">
                    Total <SortIcon field="total" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Estado <SortIcon field="status" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("due_date")}
                >
                  <div className="flex items-center gap-1">
                    Vencimiento <SortIcon field="due_date" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-4" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredAndSortedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="h-12 w-12 text-muted-foreground/50" />
                      <div>
                        <p className="font-medium text-foreground">No se encontraron facturas</p>
                        <p className="text-sm text-muted-foreground">Ajusta los filtros de búsqueda</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedInvoices.map((invoice) => {
                  const status = statusConfig[invoice.status] || statusConfig.pending
                  const isPaid = invoice.status === "paid"
                  return (
                    <tr key={invoice.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedRows.includes(invoice.id)}
                          onCheckedChange={() => toggleRow(invoice.id)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/billing/invoices/${invoice.id}`}
                          className="font-mono text-sm font-medium text-primary hover:underline"
                        >
                          #{invoice.increment_id}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {invoice.customer?.first_name} {invoice.customer?.last_name}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-foreground">{formatCurrency(invoice.total)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={`${status.color} border`}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(invoice.due_date)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/billing/invoices/${invoice.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {!isPaid && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <RegisterPaymentDialog
                                  invoiceId={invoice.id}
                                  invoiceNumber={invoice.increment_id?.toString()}
                                  total={invoice.total}
                                  onSuccess={handleActionSuccess}
                                  trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                      <DollarSign className="mr-2 h-4 w-4" />
                                      Registrar Pago
                                    </DropdownMenuItem>
                                  }
                                />
                                <ApplyDiscountDialog
                                  invoiceId={invoice.id}
                                  invoiceNumber={invoice.increment_id?.toString()}
                                  total={invoice.total}
                                  onSuccess={handleActionSuccess}
                                  trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                      <Percent className="mr-2 h-4 w-4" />
                                      Aplicar Descuento
                                    </DropdownMenuItem>
                                  }
                                />
                                <DropdownMenuSeparator />
                                <PaymentPromiseDialog
                                  invoiceId={invoice.id}
                                  invoiceNumber={invoice.increment_id?.toString()}
                                  total={invoice.total}
                                  onSuccess={handleActionSuccess}
                                  trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                      <Clock className="mr-2 h-4 w-4" />
                                      Promesa de Pago
                                    </DropdownMenuItem>
                                  }
                                />
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Mostrando</span>
          <Select value={pageSize.toString()} onValueChange={(val) => setPageSize(Number(val))}>
            <SelectTrigger className="w-[70px] h-8 bg-card border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>de {totalItems} facturas</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="bg-transparent"
          >
            Anterior
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number
              if (totalPages <= 5) {
                page = i + 1
              } else if (currentPage <= 3) {
                page = i + 1
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i
              } else {
                page = currentPage - 2 + i
              }
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "" : "bg-transparent"}
                >
                  {page}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="bg-transparent"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}

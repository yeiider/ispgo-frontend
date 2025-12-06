"use client"

import { useState } from "react"
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

interface Client {
  id: string
  name: string
  email: string
  phone: string
  plan: string
  status: "active" | "suspended" | "pending" | "cancelled"
  balance: number
  lastPayment: string
  zone: string
  ip: string
}

const mockClients: Client[] = [
  {
    id: "CLI-001",
    name: "María García López",
    email: "maria.garcia@email.com",
    phone: "+52 555 123 4567",
    plan: "Fibra 100 Mbps",
    status: "active",
    balance: 0,
    lastPayment: "2024-01-15",
    zone: "Sector Norte",
    ip: "192.168.1.101",
  },
  {
    id: "CLI-002",
    name: "Juan Rodríguez Martínez",
    email: "juan.rodriguez@email.com",
    phone: "+52 555 234 5678",
    plan: "Fibra 50 Mbps",
    status: "active",
    balance: 0,
    lastPayment: "2024-01-14",
    zone: "Sector Centro",
    ip: "192.168.1.102",
  },
  {
    id: "CLI-003",
    name: "Ana Fernández Sánchez",
    email: "ana.fernandez@email.com",
    phone: "+52 555 345 6789",
    plan: "Fibra 200 Mbps",
    status: "suspended",
    balance: 850,
    lastPayment: "2023-12-01",
    zone: "Sector Sur",
    ip: "192.168.1.103",
  },
  {
    id: "CLI-004",
    name: "Carlos Hernández Díaz",
    email: "carlos.hernandez@email.com",
    phone: "+52 555 456 7890",
    plan: "Fibra 100 Mbps",
    status: "active",
    balance: 0,
    lastPayment: "2024-01-13",
    zone: "Sector Norte",
    ip: "192.168.1.104",
  },
  {
    id: "CLI-005",
    name: "Laura Martínez Ruiz",
    email: "laura.martinez@email.com",
    phone: "+52 555 567 8901",
    plan: "Fibra 50 Mbps",
    status: "pending",
    balance: 425,
    lastPayment: "2024-01-05",
    zone: "Sector Este",
    ip: "192.168.1.105",
  },
  {
    id: "CLI-006",
    name: "Pedro Sánchez Gómez",
    email: "pedro.sanchez@email.com",
    phone: "+52 555 678 9012",
    plan: "Fibra 300 Mbps",
    status: "active",
    balance: 0,
    lastPayment: "2024-01-16",
    zone: "Sector Oeste",
    ip: "192.168.1.106",
  },
  {
    id: "CLI-007",
    name: "Sofía López Torres",
    email: "sofia.lopez@email.com",
    phone: "+52 555 789 0123",
    plan: "Fibra 100 Mbps",
    status: "cancelled",
    balance: 1700,
    lastPayment: "2023-10-15",
    zone: "Sector Centro",
    ip: "192.168.1.107",
  },
  {
    id: "CLI-008",
    name: "Diego Ramírez Vega",
    email: "diego.ramirez@email.com",
    phone: "+52 555 890 1234",
    plan: "Fibra 50 Mbps",
    status: "active",
    balance: 0,
    lastPayment: "2024-01-12",
    zone: "Sector Norte",
    ip: "192.168.1.108",
  },
]

const statusConfig = {
  active: { label: "Activo", color: "bg-accent/20 text-accent border-accent/30" },
  suspended: { label: "Suspendido", color: "bg-warning/20 text-warning border-warning/30" },
  pending: { label: "Pendiente", color: "bg-primary/20 text-primary border-primary/30" },
  cancelled: { label: "Cancelado", color: "bg-destructive/20 text-destructive border-destructive/30" },
}

type SortField = "name" | "plan" | "status" | "balance" | "zone"
type SortOrder = "asc" | "desc"

export function DataTable() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [zoneFilter, setZoneFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredClients = mockClients
    .filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()) ||
        client.id.toLowerCase().includes(search.toLowerCase()) ||
        client.ip.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || client.status === statusFilter
      const matchesZone = zoneFilter === "all" || client.zone === zoneFilter
      return matchesSearch && matchesStatus && matchesZone
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      const order = sortOrder === "asc" ? 1 : -1
      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * order
      }
      return ((aValue as number) - (bValue as number)) * order
    })

  const totalPages = Math.ceil(filteredClients.length / pageSize)
  const paginatedClients = filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedClients.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(paginatedClients.map((c) => c.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const zones = [...new Set(mockClients.map((c) => c.zone))]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <CardTitle className="text-lg">Gestión de Clientes</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email, ID, IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-secondary/50">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger className="w-[160px] bg-secondary/50">
                <SelectValue placeholder="Zona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las zonas</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
          </div>
        </div>

        {(search || statusFilter !== "all" || zoneFilter !== "all" || selectedRows.length > 0) && (
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
                Estado: {statusConfig[statusFilter as keyof typeof statusConfig]?.label}
                <button onClick={() => setStatusFilter("all")} className="ml-1 hover:text-foreground">
                  ×
                </button>
              </Badge>
            )}
            {zoneFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Zona: {zoneFilter}
                <button onClick={() => setZoneFilter("all")} className="ml-1 hover:text-foreground">
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
                    checked={selectedRows.length === paginatedClients.length && paginatedClients.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                <th
                  className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Cliente
                    <SortIcon field="name" />
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
                  onClick={() => toggleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Estado
                    <SortIcon field="status" />
                  </div>
                </th>
                <th
                  className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("balance")}
                >
                  <div className="flex items-center gap-1">
                    Saldo
                    <SortIcon field="balance" />
                  </div>
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">IP</th>
                <th
                  className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("zone")}
                >
                  <div className="flex items-center gap-1">
                    Zona
                    <SortIcon field="zone" />
                  </div>
                </th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.map((client) => (
                <tr
                  key={client.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/30",
                    selectedRows.includes(client.id) && "bg-primary/5",
                  )}
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedRows.includes(client.id)}
                      onCheckedChange={() => toggleSelectRow(client.id)}
                    />
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-sm text-primary">{client.id}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{client.name}</span>
                      <span className="text-xs text-muted-foreground">{client.email}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm">{client.plan}</span>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className={statusConfig[client.status].color}>
                      {statusConfig[client.status].label}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <span className={cn("font-mono text-sm", client.balance > 0 ? "text-destructive" : "text-accent")}>
                      ${client.balance.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-xs text-muted-foreground">{client.ip}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm">{client.zone}</span>
                  </td>
                  <td className="p-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
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
            <span>de {filteredClients.length} resultados</span>
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

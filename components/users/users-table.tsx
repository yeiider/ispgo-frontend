"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  RefreshCw,
  Loader2,
  Shield,
  Key,
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
import type { SystemUser } from "@/lib/graphql/types"
import { getUsers, deleteUser } from "@/app/actions/users"
import { UserFormDialog } from "./user-form-dialog"
import { UserRolesDialog } from "./user-roles-dialog"
import { UserPermissionsDialog } from "./user-permissions-dialog"

type SortField = "name" | "email" | "created_at"
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

export function UsersTable() {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null)

  const debouncedSearch = useDebounce(search, 400)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const filters = {
        search: debouncedSearch || undefined,
      }

      const result = await getUsers(currentPage, pageSize, filters)
      if (result.success && result.data) {
        setUsers(result.data.data)
        setTotalPages(result.data.paginatorInfo.lastPage)
        setTotalItems(result.data.paginatorInfo.total)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const sortedUsers = [...users].sort((a, b) => {
    let aValue: string | number = ""
    let bValue: string | number = ""

    switch (sortField) {
      case "name":
        aValue = a.name
        bValue = b.name
        break
      case "email":
        aValue = a.email || ""
        bValue = b.email || ""
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
    if (selectedRows.length === sortedUsers.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(sortedUsers.map((u) => u.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    setDeleting(true)
    try {
      const result = await deleteUser(userToDelete.id)
      if (result.success) {
        await fetchUsers()
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user)
    setFormDialogOpen(true)
  }

  const handleNewUser = () => {
    setEditingUser(null)
    setFormDialogOpen(true)
  }

  const handleManageRoles = (user: SystemUser) => {
    setSelectedUser(user)
    setRolesDialogOpen(true)
  }

  const handleManagePermissions = (user: SystemUser) => {
    setSelectedUser(user)
    setPermissionsDialogOpen(true)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">Gestión de Usuarios</CardTitle>
              <Badge variant="secondary" className="font-mono">
                {totalItems} total
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-secondary/50"
                />
                {loading && search && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              <Button variant="outline" size="icon" className="bg-transparent" onClick={fetchUsers} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>

              <Button
                size="sm"
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleNewUser}
              >
                <UserPlus className="h-4 w-4" />
                Nuevo Usuario
              </Button>
            </div>
          </div>

          {(search || selectedRows.length > 0) && (
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
                      checked={selectedRows.length === sortedUsers.length && sortedUsers.length > 0}
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
                      Usuario
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Permisos
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
                    <td colSpan={7} className="p-8 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Cargando usuarios...
                      </div>
                    </td>
                  </tr>
                ) : sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-muted/30",
                        selectedRows.includes(user.id) && "bg-primary/5",
                      )}
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={selectedRows.includes(user.id)}
                          onCheckedChange={() => toggleSelectRow(user.id)}
                        />
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-sm text-primary">#{user.id}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.slice(0, 2).map((role) => (
                            <Badge
                              key={role.id}
                              variant="outline"
                              className="text-xs bg-primary/10 text-primary border-primary/30"
                            >
                              {role.name}
                            </Badge>
                          ))}
                          {user.roles?.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{user.roles.length - 2}
                            </Badge>
                          )}
                          {(!user.roles || user.roles.length === 0) && (
                            <span className="text-xs text-muted-foreground">Sin roles</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {user.allPermissions?.length || 0} permisos
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("es-ES")}
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
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleManageRoles(user)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Gestionar Roles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManagePermissions(user)}>
                              <Key className="mr-2 h-4 w-4" />
                              Permisos Directos
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setUserToDelete(user)
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
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
              <strong>{userToDelete?.name}</strong> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
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

      {/* User Form Dialog */}
      <UserFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        user={editingUser}
        onSuccess={fetchUsers}
      />

      {/* Roles Dialog */}
      <UserRolesDialog
        open={rolesDialogOpen}
        onOpenChange={setRolesDialogOpen}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      {/* Permissions Dialog */}
      <UserPermissionsDialog
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
    </>
  )
}

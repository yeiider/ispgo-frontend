"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Loader2, Shield, Key, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import type { Role, Permission } from "@/lib/graphql/types"
import { getRoles, getPermissions, deleteRole, deletePermission, syncPermissionsToRole } from "@/app/actions/users"
import { RoleFormDialog } from "./role-form-dialog"
import { PermissionFormDialog } from "./permission-form-dialog"

export function RolesPermissionsManager() {
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [searchRoles, setSearchRoles] = useState("")
  const [searchPermissions, setSearchPermissions] = useState("")

  // Dialogs
  const [roleFormOpen, setRoleFormOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [permissionFormOpen, setPermissionFormOpen] = useState(false)
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [deletePermDialogOpen, setDeletePermDialogOpen] = useState(false)
  const [permToDelete, setPermToDelete] = useState<Permission | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [rolesResult, permsResult] = await Promise.all([getRoles(), getPermissions()])
      if (rolesResult.success && rolesResult.data) {
        setRoles(rolesResult.data)
      }
      if (permsResult.success && permsResult.data) {
        setPermissions(permsResult.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (selectedRole) {
      setSelectedPermissions(selectedRole.permissions?.map((p) => p.id) || [])
    }
  }, [selectedRole])

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role)
  }

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) => (prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]))
  }

  const handleSavePermissions = async () => {
    if (!selectedRole) return
    setSaving(true)
    try {
      const result = await syncPermissionsToRole(selectedRole.id, selectedPermissions)
      if (result.success) {
        await fetchData()
        // Update selected role with new permissions
        const updatedRole = roles.find((r) => r.id === selectedRole.id)
        if (updatedRole) {
          setSelectedRole({
            ...updatedRole,
            permissions: permissions.filter((p) => selectedPermissions.includes(p.id)),
          })
        }
      }
    } catch (error) {
      console.error("Error saving permissions:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!roleToDelete) return
    setDeleting(true)
    try {
      const result = await deleteRole(roleToDelete.id)
      if (result.success) {
        if (selectedRole?.id === roleToDelete.id) {
          setSelectedRole(null)
        }
        await fetchData()
      }
    } catch (error) {
      console.error("Error deleting role:", error)
    } finally {
      setDeleting(false)
      setDeleteRoleDialogOpen(false)
      setRoleToDelete(null)
    }
  }

  const handleDeletePermission = async () => {
    if (!permToDelete) return
    setDeleting(true)
    try {
      const result = await deletePermission(permToDelete.id)
      if (result.success) {
        await fetchData()
      }
    } catch (error) {
      console.error("Error deleting permission:", error)
    } finally {
      setDeleting(false)
      setDeletePermDialogOpen(false)
      setPermToDelete(null)
    }
  }

  const filteredRoles = roles.filter((r) => r.name.toLowerCase().includes(searchRoles.toLowerCase()))

  const filteredPermissions = permissions.filter((p) => p.name.toLowerCase().includes(searchPermissions.toLowerCase()))

  const hasChanges = selectedRole
    ? JSON.stringify(selectedPermissions.sort()) !==
      JSON.stringify(selectedRole.permissions?.map((p) => p.id).sort() || [])
    : false

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Roles Panel */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Roles</CardTitle>
            </div>
            <Button
              size="sm"
              className="gap-1"
              onClick={() => {
                setEditingRole(null)
                setRoleFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Nuevo
            </Button>
          </div>
          <CardDescription>Selecciona un rol para gestionar sus permisos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar roles..."
              value={searchRoles}
              onChange={(e) => setSearchRoles(e.target.value)}
              className="pl-9 bg-secondary/50"
            />
          </div>

          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2 pr-4">
                {filteredRoles.map((role) => (
                  <div
                    key={role.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group",
                      selectedRole?.id === role.id
                        ? "bg-primary/10 border-primary/30"
                        : "bg-secondary/30 border-border hover:bg-secondary/50",
                    )}
                    onClick={() => handleSelectRole(role)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          selectedRole?.id === role.id ? "bg-primary" : "bg-muted-foreground",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{role.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{role.permissions?.length || 0} permisos</span>
                          <span>·</span>
                          <span>{role.users?.length || 0} usuarios</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingRole(role)
                            setRoleFormOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            setRoleToDelete(role)
                            setDeleteRoleDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
                {filteredRoles.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No se encontraron roles</p>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Permissions Panel */}
      <Card className="bg-card border-border lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                Permisos {selectedRole && <span className="text-muted-foreground">- {selectedRole.name}</span>}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1 bg-transparent"
                onClick={() => setPermissionFormOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Nuevo Permiso
              </Button>
              {selectedRole && hasChanges && (
                <Button size="sm" className="gap-1" onClick={handleSavePermissions} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Guardar
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            {selectedRole
              ? "Marca los permisos que deseas asignar a este rol"
              : "Selecciona un rol para gestionar sus permisos"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar permisos..."
              value={searchPermissions}
              onChange={(e) => setSearchPermissions(e.target.value)}
              className="pl-9 bg-secondary/50"
            />
          </div>

          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : !selectedRole ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mb-4 opacity-50" />
                <p>Selecciona un rol para ver y gestionar sus permisos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-4">
                {filteredPermissions.map((perm) => {
                  const isSelected = selectedPermissions.includes(perm.id)
                  return (
                    <div
                      key={perm.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group",
                        isSelected
                          ? "bg-primary/10 border-primary/30"
                          : "bg-secondary/30 border-border hover:bg-secondary/50",
                      )}
                      onClick={() => togglePermission(perm.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox checked={isSelected} onCheckedChange={() => togglePermission(perm.id)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{perm.name}</p>
                          <p className="text-xs text-muted-foreground">{perm.roles?.length || 0} roles</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPermToDelete(perm)
                              setDeletePermDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })}
                {filteredPermissions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 col-span-2">No se encontraron permisos</p>
                )}
              </div>
            )}
          </ScrollArea>

          {selectedRole && (
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="text-sm text-muted-foreground">
                {selectedPermissions.length} de {permissions.length} permisos seleccionados
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPermissions(permissions.map((p) => p.id))}
                >
                  Seleccionar todos
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedPermissions([])}>
                  Deseleccionar todos
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Form Dialog */}
      <RoleFormDialog open={roleFormOpen} onOpenChange={setRoleFormOpen} role={editingRole} onSuccess={fetchData} />

      {/* Permission Form Dialog */}
      <PermissionFormDialog open={permissionFormOpen} onOpenChange={setPermissionFormOpen} onSuccess={fetchData} />

      {/* Delete Role Dialog */}
      <AlertDialog open={deleteRoleDialogOpen} onOpenChange={setDeleteRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rol?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el rol <strong>{roleToDelete?.name}</strong> y se removerá
              de todos los usuarios que lo tengan asignado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Permission Dialog */}
      <AlertDialog open={deletePermDialogOpen} onOpenChange={setDeletePermDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar permiso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el permiso <strong>{permToDelete?.name}</strong> y se
              removerá de todos los roles y usuarios que lo tengan asignado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePermission}
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

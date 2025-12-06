"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Key, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SystemUser, Permission } from "@/lib/graphql/types"
import { getPermissions, syncPermissionsToUser } from "@/app/actions/users"
import { cn } from "@/lib/utils"

interface UserPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: SystemUser | null
  onSuccess: () => void
}

// Group permissions by module
function groupPermissions(permissions: Permission[]) {
  const groups: Record<string, Permission[]> = {}

  permissions.forEach((perm) => {
    const parts = perm.name.split("_")
    const module = parts.length > 1 ? parts[parts.length - 1] : "general"
    if (!groups[module]) {
      groups[module] = []
    }
    groups[module].push(perm)
  })

  return groups
}

export function UserPermissionsDialog({ open, onOpenChange, user, onSuccess }: UserPermissionsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [search, setSearch] = useState("")

  const fetchPermissions = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getPermissions()
      if (result.success && result.data) {
        setPermissions(result.data)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchPermissions()
      if (user?.permissions) {
        setSelectedPermissions(user.permissions.map((p) => p.id))
      } else {
        setSelectedPermissions([])
      }
      setError(null)
      setSearch("")
    }
  }, [open, user, fetchPermissions])

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) => (prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setError(null)

    try {
      const result = await syncPermissionsToUser(user.id, selectedPermissions)
      if (!result.success) {
        setError(result.error || "Error al actualizar permisos")
        return
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const filteredPermissions = permissions.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  const groupedPermissions = groupPermissions(filteredPermissions)
  const inheritedPermissionIds = new Set(user?.roles?.flatMap((r) => r.permissions?.map((p) => p.id) || []) || [])

  const hasChanges = user
    ? JSON.stringify(selectedPermissions.sort()) !== JSON.stringify(user.permissions?.map((p) => p.id).sort() || [])
    : false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Permisos Directos
          </DialogTitle>
          <DialogDescription>
            Asigna permisos directos a <strong>{user?.name}</strong>. Los permisos heredados de roles se muestran pero
            no pueden modificarse aquí.
          </DialogDescription>
        </DialogHeader>

        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar permisos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-transparent p-0">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary/10">
                Todos
              </TabsTrigger>
              {Object.keys(groupedPermissions).map((group) => (
                <TabsTrigger key={group} value={group} className="data-[state=active]:bg-primary/10 capitalize">
                  {group}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <ScrollArea className="h-[300px] pr-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredPermissions.map((perm) => {
                    const isSelected = selectedPermissions.includes(perm.id)
                    const isInherited = inheritedPermissionIds.has(perm.id)
                    return (
                      <div
                        key={perm.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg border transition-all",
                          isInherited
                            ? "bg-accent/10 border-accent/30 opacity-70"
                            : isSelected
                              ? "bg-primary/10 border-primary/30 cursor-pointer"
                              : "bg-secondary/30 border-border hover:bg-secondary/50 cursor-pointer",
                        )}
                        onClick={() => !isInherited && togglePermission(perm.id)}
                      >
                        <Checkbox
                          checked={isSelected || isInherited}
                          disabled={isInherited}
                          onCheckedChange={() => !isInherited && togglePermission(perm.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{perm.name}</p>
                          {isInherited && <p className="text-[10px] text-muted-foreground">Heredado de rol</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {Object.entries(groupedPermissions).map(([group, perms]) => (
              <TabsContent key={group} value={group} className="mt-4">
                <ScrollArea className="h-[300px] pr-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((perm) => {
                      const isSelected = selectedPermissions.includes(perm.id)
                      const isInherited = inheritedPermissionIds.has(perm.id)
                      return (
                        <div
                          key={perm.id}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg border transition-all",
                            isInherited
                              ? "bg-accent/10 border-accent/30 opacity-70"
                              : isSelected
                                ? "bg-primary/10 border-primary/30 cursor-pointer"
                                : "bg-secondary/30 border-border hover:bg-secondary/50 cursor-pointer",
                          )}
                          onClick={() => !isInherited && togglePermission(perm.id)}
                        >
                          <Checkbox
                            checked={isSelected || isInherited}
                            disabled={isInherited}
                            onCheckedChange={() => !isInherited && togglePermission(perm.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{perm.name}</p>
                            {isInherited && <p className="text-[10px] text-muted-foreground">Heredado de rol</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedPermissions.length} directos + {inheritedPermissionIds.size} heredados
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !hasChanges}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar cambios
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

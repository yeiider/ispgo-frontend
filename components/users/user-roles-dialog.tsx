"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SystemUser, Role } from "@/lib/graphql/types"
import { getRoles, syncRolesToUser } from "@/app/actions/users"
import { cn } from "@/lib/utils"

interface UserRolesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: SystemUser | null
  onSuccess: () => void
}

export function UserRolesDialog({ open, onOpenChange, user, onSuccess }: UserRolesDialogProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getRoles()
      if (result.success && result.data) {
        setRoles(result.data)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchRoles()
      if (user?.roles) {
        setSelectedRoles(user.roles.map((r) => r.id))
      } else {
        setSelectedRoles([])
      }
      setError(null)
    }
  }, [open, user, fetchRoles])

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setError(null)

    try {
      const result = await syncRolesToUser(user.id, selectedRoles)
      if (!result.success) {
        setError(result.error || "Error al actualizar roles")
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

  const hasChanges = user
    ? JSON.stringify(selectedRoles.sort()) !== JSON.stringify(user.roles?.map((r) => r.id).sort() || [])
    : false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Gestionar Roles
          </DialogTitle>
          <DialogDescription>
            Asigna o remueve roles para <strong>{user?.name}</strong>. Los roles determinan los permisos heredados del
            usuario.
          </DialogDescription>
        </DialogHeader>

        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {roles.map((role) => {
                const isSelected = selectedRoles.includes(role.id)
                return (
                  <div
                    key={role.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary/10 border-primary/30"
                        : "bg-secondary/30 border-border hover:bg-secondary/50",
                    )}
                    onClick={() => toggleRole(role.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleRole(role.id)} />
                      <div>
                        <p className="font-medium text-foreground">{role.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {role.permissions?.length || 0} permisos asociados
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {role.permissions?.slice(0, 3).map((perm) => (
                        <Badge key={perm.id} variant="secondary" className="text-[10px]">
                          {perm.name}
                        </Badge>
                      ))}
                      {(role.permissions?.length || 0) > 3 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{role.permissions!.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
              {roles.length === 0 && <p className="text-center text-muted-foreground py-8">No hay roles disponibles</p>}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{selectedRoles.length} roles seleccionados</div>
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

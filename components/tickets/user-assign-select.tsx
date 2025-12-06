"use client"

import { useState, useEffect, useCallback } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPlus, Search, Loader2, Users } from "lucide-react"
import { getUsersSimple } from "@/app/actions/users"

interface SimpleUser {
  id: string
  name: string
  email: string
  telephone?: string
}

interface UserAssignSelectProps {
  ticketId: string
  assignedUsers: Array<{ id: string; name?: string; email?: string }>
  onAssign: (userIds: string[]) => Promise<void>
  disabled?: boolean
}

export function UserAssignSelect({ ticketId, assignedUsers, onAssign, disabled }: UserAssignSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<SimpleUser[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Initialize selected IDs from assigned users
  useEffect(() => {
    setSelectedIds(assignedUsers.map((u) => u.id))
  }, [assignedUsers])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getUsersSimple(1, 50, search || undefined)
      if (result.success && result.data) {
        setUsers(result.data.data)
      }
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    if (open) {
      loadUsers()
    }
  }, [open, loadUsers])

  const handleToggleUser = (userId: string) => {
    setSelectedIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onAssign(selectedIds)
      setOpen(false)
    } catch (error) {
      console.error("Error assigning users:", error)
    } finally {
      setSaving(false)
    }
  }

  const hasChanges =
    selectedIds.length !== assignedUsers.length || !selectedIds.every((id) => assignedUsers.some((u) => u.id === id))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className="gap-2 bg-transparent">
          <UserPlus className="h-4 w-4" />
          Asignar
          {assignedUsers.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
              {assignedUsers.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b border-border">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Asignar Usuarios
          </h4>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        <ScrollArea className="h-[250px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No se encontraron usuarios</div>
          ) : (
            <div className="p-2 space-y-1">
              {users.map((user) => {
                const isSelected = selectedIds.includes(user.id)
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                    onClick={() => handleToggleUser(user.id)}
                  >
                    <Checkbox checked={isSelected} />
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                        {user.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !hasChanges}>
            {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Guardar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

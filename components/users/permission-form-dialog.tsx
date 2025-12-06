"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createPermission } from "@/app/actions/users"

interface PermissionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PermissionFormDialog({ open, onOpenChange, onSuccess }: PermissionFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")

  useEffect(() => {
    if (open) {
      setName("")
      setError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await createPermission({ name })
      if (!result.success) {
        setError(result.error || "Error al crear permiso")
        return
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Nuevo Permiso</DialogTitle>
          <DialogDescription>
            Ingresa el nombre para el nuevo permiso. Usa un formato descriptivo como{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">create_customers</code> o{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">manage_invoices</code>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="permName">Nombre del permiso</Label>
            <Input
              id="permName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: create_customers, view_reports"
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Crear permiso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

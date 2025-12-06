"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { registerPaymentPromise } from "@/app/actions/invoice-actions"
import { useToast } from "@/hooks/use-toast"

interface PaymentPromiseDialogProps {
  invoiceId: string
  invoiceNumber?: string
  total: number
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function PaymentPromiseDialog({
  invoiceId,
  invoiceNumber,
  total,
  onSuccess,
  trigger,
}: PaymentPromiseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [promiseDate, setPromiseDate] = useState("")
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
      amount,
    )
  }

  const handleSubmit = async () => {
    if (!promiseDate) {
      toast({
        title: "Error",
        description: "Selecciona una fecha de promesa de pago",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await registerPaymentPromise(invoiceId, promiseDate, notes || undefined)

      if (result.success) {
        toast({
          title: "Promesa registrada",
          description: result.message || "La promesa de pago se ha registrado exitosamente",
        })
        setOpen(false)
        setPromiseDate("")
        setNotes("")
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo registrar la promesa de pago",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar la promesa de pago",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate minimum date (today)
  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 bg-transparent">
            <Clock className="h-4 w-4" />
            Promesa de Pago
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Registrar Promesa de Pago
          </DialogTitle>
          <DialogDescription>
            Registrar una promesa de pago para la factura {invoiceNumber ? `#${invoiceNumber}` : `#${invoiceId}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-sm text-muted-foreground">Monto prometido</p>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="promiseDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha de promesa de pago
            </Label>
            <Input
              id="promiseDate"
              type="date"
              value={promiseDate}
              onChange={(e) => setPromiseDate(e.target.value)}
              min={today}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Agregar notas sobre la promesa de pago..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !promiseDate} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Registrar Promesa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

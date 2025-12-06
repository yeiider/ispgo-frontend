"use client"

import type React from "react"

import { useState } from "react"
import { DollarSign, Loader2, CreditCard, Banknote, Building2, Globe } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { registerPayment } from "@/app/actions/invoice-actions"
import { useToast } from "@/hooks/use-toast"

interface RegisterPaymentDialogProps {
  invoiceId: string
  invoiceNumber?: string
  total: number
  onSuccess?: () => void
  trigger?: React.ReactNode
}

const paymentMethods = [
  { value: "cash", label: "Efectivo", icon: Banknote },
  { value: "transfer", label: "Transferencia", icon: Building2 },
  { value: "card", label: "Tarjeta", icon: CreditCard },
  { value: "online", label: "Pago Online", icon: Globe },
]

export function RegisterPaymentDialog({
  invoiceId,
  invoiceNumber,
  total,
  onSuccess,
  trigger,
}: RegisterPaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
      amount,
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await registerPayment(invoiceId, paymentMethod, notes || undefined)

      if (result.success) {
        toast({
          title: "Pago registrado",
          description: result.message || "El pago se ha registrado exitosamente",
        })
        setOpen(false)
        setPaymentMethod("cash")
        setNotes("")
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo registrar el pago",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar el pago",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <DollarSign className="h-4 w-4" />
            Registrar Pago
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Registrar Pago
          </DialogTitle>
          <DialogDescription>
            Registrar pago para la factura {invoiceNumber ? `#${invoiceNumber}` : `#${invoiceId}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">Total a pagar</p>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          </div>

          <div className="space-y-3">
            <Label>Método de pago</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <div key={method.value}>
                  <RadioGroupItem value={method.value} id={method.value} className="peer sr-only" />
                  <Label
                    htmlFor={method.value}
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                  >
                    <method.icon className="mb-2 h-5 w-5" />
                    <span className="text-sm font-medium">{method.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Agregar notas sobre el pago..."
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
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

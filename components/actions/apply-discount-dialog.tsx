"use client"

import type React from "react"

import { useState } from "react"
import { Percent, Loader2 } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { applyDiscount } from "@/app/actions/invoice-actions"
import { useToast } from "@/hooks/use-toast"

interface ApplyDiscountDialogProps {
  invoiceId: string
  invoiceNumber?: string
  total: number
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function ApplyDiscountDialog({ invoiceId, invoiceNumber, total, onSuccess, trigger }: ApplyDiscountDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [discount, setDiscount] = useState("")
  const [isPercentage, setIsPercentage] = useState(true)
  const [includeTax, setIncludeTax] = useState(false)
  const { toast } = useToast()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
      amount,
    )
  }

  const calculateDiscountedTotal = () => {
    const discountValue = Number.parseFloat(discount) || 0
    if (isPercentage) {
      return total - (total * discountValue) / 100
    }
    return total - discountValue
  }

  const handleSubmit = async () => {
    const discountValue = Number.parseFloat(discount)
    if (!discountValue || discountValue <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un valor de descuento válido",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await applyDiscount(invoiceId, discountValue, isPercentage, includeTax)

      if (result.success) {
        toast({
          title: "Descuento aplicado",
          description: result.message || "El descuento se ha aplicado exitosamente",
        })
        setOpen(false)
        setDiscount("")
        setIsPercentage(true)
        setIncludeTax(false)
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo aplicar el descuento",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al aplicar el descuento",
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
          <Button variant="outline" className="gap-2 bg-transparent">
            <Percent className="h-4 w-4" />
            Aplicar Descuento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            Aplicar Descuento
          </DialogTitle>
          <DialogDescription>
            Aplicar descuento a la factura {invoiceNumber ? `#${invoiceNumber}` : `#${invoiceId}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total actual</span>
              <span className="font-medium">{formatCurrency(total)}</span>
            </div>
            {discount && (
              <>
                <div className="flex justify-between items-center mt-2 text-destructive">
                  <span className="text-sm">Descuento</span>
                  <span className="font-medium">
                    -{isPercentage ? `${discount}%` : formatCurrency(Number.parseFloat(discount) || 0)}
                  </span>
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between items-center">
                  <span className="text-sm font-medium">Nuevo total</span>
                  <span className="font-bold text-lg">{formatCurrency(calculateDiscountedTotal())}</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Valor del descuento</Label>
            <div className="relative">
              <Input
                id="discount"
                type="number"
                placeholder={isPercentage ? "10" : "5000"}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {isPercentage ? "%" : "COP"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="percentage" className="cursor-pointer">
              Descuento en porcentaje
            </Label>
            <Switch id="percentage" checked={isPercentage} onCheckedChange={setIsPercentage} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="tax" className="cursor-pointer">
              Incluir impuestos
            </Label>
            <Switch id="tax" checked={includeTax} onCheckedChange={setIncludeTax} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !discount} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Aplicar Descuento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

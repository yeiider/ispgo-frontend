"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, AlertTriangle, ArrowUp, Minus, Loader2 } from "lucide-react"
import { createTicket } from "@/app/actions/tickets"
import { CustomerSearchSelect } from "./customer-search-select"
import { ServiceSearchSelect } from "./service-search-select"
import type { Customer, Service } from "@/lib/graphql/types"

interface CreateTicketModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const issueTypes = [
  "Problema de Conexión",
  "Lentitud de Internet",
  "Sin Servicio",
  "Problema de Router",
  "Facturación",
  "Cambio de Plan",
  "Instalación",
  "Consulta General",
  "Otro",
]

const contactMethods = ["Teléfono", "WhatsApp", "Email", "Presencial", "Chat"]

export function CreateTicketModal({ open, onClose, onSuccess }: CreateTicketModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    issue_type: "",
    priority: "medium",
    contact_method: "",
    customer_id: "",
    service_id: "",
  })
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.issue_type) return

    setIsSubmitting(true)
    try {
      await createTicket({
        title: formData.title,
        description: formData.description,
        issue_type: formData.issue_type,
        priority: formData.priority,
        contact_method: formData.contact_method || undefined,
        customer_id: formData.customer_id || undefined,
        service_id: formData.service_id || undefined,
      })
      onSuccess?.()
      onClose()
      // Reset form
      setFormData({
        title: "",
        description: "",
        issue_type: "",
        priority: "medium",
        contact_method: "",
        customer_id: "",
        service_id: "",
      })
      setSelectedCustomer(null)
      setSelectedService(null)
    } catch (error) {
      console.error("Error creating ticket:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer)
    setFormData((prev) => ({
      ...prev,
      customer_id: customer?.id || "",
      // Clear service if customer changes
      service_id: customer ? prev.service_id : "",
    }))
    // Clear selected service if customer is cleared or changed
    if (!customer || (selectedService?.customer?.id && selectedService.customer.id !== customer.id)) {
      setSelectedService(null)
      setFormData((prev) => ({ ...prev, service_id: "" }))
    }
  }

  const handleServiceSelect = (service: Service | null) => {
    setSelectedService(service)
    setFormData((prev) => ({ ...prev, service_id: service?.id || "" }))
    // Auto-select customer if service has one and no customer selected
    if (service?.customer && !selectedCustomer) {
      setSelectedCustomer(service.customer)
      setFormData((prev) => ({ ...prev, customer_id: service.customer!.id }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Ticket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Describe brevemente el problema..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Issue Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue_type">Tipo de Problema *</Label>
              <Select
                value={formData.issue_type}
                onValueChange={(value) => setFormData({ ...formData, issue_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                      Baja
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-3.5 w-3.5 text-primary" />
                      Media
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                      Alta
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                      Urgente
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Method */}
          <div className="space-y-2">
            <Label htmlFor="contact_method">Método de Contacto</Label>
            <Select
              value={formData.contact_method}
              onValueChange={(value) => setFormData({ ...formData, contact_method: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {contactMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              placeholder="Describe el problema en detalle..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[120px] resize-none"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente (opcional)</Label>
              <CustomerSearchSelect
                value={formData.customer_id}
                onSelect={handleCustomerSelect}
                selectedCustomer={selectedCustomer}
              />
            </div>
            <div className="space-y-2">
              <Label>Servicio (opcional)</Label>
              <ServiceSearchSelect
                value={formData.service_id}
                onSelect={handleServiceSelect}
                selectedService={selectedService}
                customerId={selectedCustomer?.id}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

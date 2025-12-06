"use client"

import { useState } from "react"
import type { Ticket, TicketComment } from "@/lib/graphql/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Wifi,
  Phone,
  Mail,
  MessageSquare,
  Paperclip,
  Clock,
  Tag,
  Users,
  Send,
  Lock,
  AlertCircle,
  AlertTriangle,
  ArrowUp,
  Minus,
  Circle,
  PlayCircle,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  addTicketComment,
  updateTicket,
  assignUsersToTicket,
  addTicketLabel,
  removeTicketLabel,
} from "@/app/actions/tickets"
import { UserAssignSelect } from "./user-assign-select"
import { LabelManager } from "./label-manager"

interface TicketDetailModalProps {
  ticket: Ticket | null
  open: boolean
  onClose: () => void
  onUpdate?: () => void
  mode?: "dialog" | "sheet"
}

const priorityConfig = {
  urgent: { icon: AlertCircle, label: "Urgente", color: "text-destructive", bg: "bg-destructive/10" },
  high: { icon: AlertTriangle, label: "Alta", color: "text-warning", bg: "bg-warning/10" },
  medium: { icon: ArrowUp, label: "Media", color: "text-primary", bg: "bg-primary/10" },
  low: { icon: Minus, label: "Baja", color: "text-muted-foreground", bg: "bg-muted" },
}

const statusConfig = {
  open: { icon: Circle, label: "Abierto", color: "text-primary", bg: "bg-primary/10" },
  in_progress: { icon: PlayCircle, label: "En Progreso", color: "text-warning", bg: "bg-warning/10" },
  resolved: { icon: CheckCircle2, label: "Resuelto", color: "text-accent", bg: "bg-accent/10" },
  closed: { icon: XCircle, label: "Cerrado", color: "text-muted-foreground", bg: "bg-muted" },
}

export function TicketDetailModal({ ticket, open, onClose, onUpdate, mode = "sheet" }: TicketDetailModalProps) {
  const [newComment, setNewComment] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(ticket?.status || "open")
  const [selectedPriority, setSelectedPriority] = useState(ticket?.priority || "medium")

  if (!ticket) return null

  const priority = priorityConfig[ticket.priority] || priorityConfig.medium
  const status = statusConfig[ticket.status] || statusConfig.open
  const PriorityIcon = priority.icon
  const StatusIcon = status.icon

  const customerName = ticket.customer
    ? `${ticket.customer.first_name} ${ticket.customer.last_name}`.trim()
    : "Sin cliente asignado"

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await addTicketComment(ticket.id, newComment, isInternal)
      setNewComment("")
      onUpdate?.()
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setSelectedStatus(newStatus as typeof selectedStatus)
    try {
      await updateTicket({ id: ticket.id, status: newStatus })
      onUpdate?.()
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    setSelectedPriority(newPriority as typeof selectedPriority)
    try {
      await updateTicket({ id: ticket.id, priority: newPriority })
      onUpdate?.()
    } catch (error) {
      console.error("Error updating priority:", error)
    }
  }

  const handleAssignUsers = async (userIds: string[]) => {
    try {
      await assignUsersToTicket(ticket.id, userIds)
      onUpdate?.()
    } catch (error) {
      console.error("Error assigning users:", error)
      throw error
    }
  }

  const handleAddLabel = async (name: string, color: string) => {
    try {
      await addTicketLabel(ticket.id, name, color)
      onUpdate?.()
    } catch (error) {
      console.error("Error adding label:", error)
      throw error
    }
  }

  const handleRemoveLabel = async (name: string) => {
    try {
      await removeTicketLabel(ticket.id, name)
      onUpdate?.()
    } catch (error) {
      console.error("Error removing label:", error)
      throw error
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: es })
    } catch {
      return "Fecha no disponible"
    }
  }

  const content = (
    <div className="flex flex-col h-full">
      {/* Header Info */}
      <div className="space-y-4 px-1">
        {/* Title & Priority/Status */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground mb-1">{ticket.title}</h2>
            <p className="text-sm text-muted-foreground">
              #{ticket.id} · {ticket.issue_type}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">
                <div className="flex items-center gap-2">
                  <Circle className="h-3 w-3 text-primary" />
                  Abierto
                </div>
              </SelectItem>
              <SelectItem value="in_progress">
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-3 w-3 text-warning" />
                  En Progreso
                </div>
              </SelectItem>
              <SelectItem value="resolved">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-accent" />
                  Resuelto
                </div>
              </SelectItem>
              <SelectItem value="closed">
                <div className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-muted-foreground" />
                  Cerrado
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPriority} onValueChange={handlePriorityChange}>
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <Minus className="h-3 w-3 text-muted-foreground" />
                  Baja
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-3 w-3 text-primary" />
                  Media
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-warning" />
                  Alta
                </div>
              </SelectItem>
              <SelectItem value="urgent">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-destructive" />
                  Urgente
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* User Assignment and Label Manager */}
          <UserAssignSelect ticketId={ticket.id} assignedUsers={ticket.users || []} onAssign={handleAssignUsers} />

          <LabelManager
            ticketId={ticket.id}
            labels={ticket.labels || []}
            onAddLabel={handleAddLabel}
            onRemoveLabel={handleRemoveLabel}
          />
        </div>

        {/* Labels */}
        {ticket.labels && ticket.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {ticket.labels.map((label) => (
              <Badge
                key={label.name}
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: label.color,
                  color: label.color,
                  backgroundColor: `${label.color}15`,
                }}
              >
                <Tag className="h-3 w-3 mr-1" />
                {label.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Tabs Content */}
      <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="details" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Detalles
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Comentarios
            {ticket.comments?.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {ticket.comments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="attachments" className="gap-1.5">
            <Paperclip className="h-3.5 w-3.5" />
            Archivos
            {ticket.attachments?.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {ticket.attachments.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="details" className="mt-0 space-y-4">
            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Descripción</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Customer Info */}
            <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </h4>
              <div className="space-y-1.5 text-sm">
                <p className="text-foreground">{customerName}</p>
                {ticket.customer?.email_address && (
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    {ticket.customer.email_address}
                  </p>
                )}
                {ticket.customer?.phone_number && (
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    {ticket.customer.phone_number}
                  </p>
                )}
              </div>
            </div>

            {/* Service Info */}
            {ticket.service && (
              <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Servicio
                </h4>
                <div className="space-y-1.5 text-sm">
                  <p className="font-mono text-foreground">{ticket.service.service_ip}</p>
                  {ticket.service.plan?.name && (
                    <p className="text-muted-foreground">Plan: {ticket.service.plan.name}</p>
                  )}
                  <Badge
                    variant={ticket.service.service_status === "active" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {ticket.service.service_status}
                  </Badge>
                </div>
              </div>
            )}

            {/* Assigned Users */}
            {ticket.users && ticket.users.length > 0 && (
              <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Asignados
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ticket.users.map((user) => (
                    <div key={user.id} className="flex items-center gap-2 bg-background rounded-full px-2 py-1">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                          {user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-foreground">{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Creado: {formatDate(ticket.created_at)}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Actualizado: {formatDate(ticket.updated_at)}
              </div>
              {ticket.closed_at && (
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5" />
                  Cerrado: {formatDate(ticket.closed_at)}
                </div>
              )}
            </div>

            {/* Resolution Notes */}
            {ticket.resolution_notes && (
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                <h4 className="text-sm font-medium text-accent mb-2">Notas de Resolución</h4>
                <p className="text-sm text-foreground whitespace-pre-wrap">{ticket.resolution_notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="mt-0 space-y-4">
            {/* Comments List */}
            <div className="space-y-3">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment: TicketComment) => (
                  <div
                    key={comment.id}
                    className={cn(
                      "p-3 rounded-lg",
                      comment.is_internal ? "bg-warning/10 border border-warning/30" : "bg-secondary/50",
                    )}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">
                          {comment.user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{comment.user?.name}</span>
                          {comment.is_internal && (
                            <Badge variant="outline" className="text-[10px] text-warning border-warning">
                              <Lock className="h-2.5 w-2.5 mr-1" />
                              Interno
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap pl-8">{comment.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay comentarios aún</p>
                </div>
              )}
            </div>

            {/* Add Comment */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Textarea
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-between">
                <Button
                  variant={isInternal ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setIsInternal(!isInternal)}
                  className={cn(isInternal && "border-warning text-warning")}
                >
                  <Lock className="h-3.5 w-3.5 mr-1.5" />
                  Comentario Interno
                </Button>
                <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim() || isSubmitting}>
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Enviar
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attachments" className="mt-0">
            {ticket.attachments && ticket.attachments.length > 0 ? (
              <div className="space-y-2">
                {ticket.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="p-2 rounded bg-primary/10">
                      <Paperclip className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{attachment.file_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{attachment.file_type}</span>
                        {attachment.file_size && (
                          <>
                            <span>·</span>
                            <span>{Math.round(attachment.file_size / 1024)} KB</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay archivos adjuntos</p>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )

  if (mode === "dialog") {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="sr-only">Detalle del Ticket</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-4 flex flex-col">
        <SheetHeader className="mb-2">
          <SheetTitle className="sr-only">Detalle del Ticket</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  )
}

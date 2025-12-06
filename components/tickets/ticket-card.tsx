"use client"

import { useMemo } from "react"
import type { Ticket } from "@/lib/graphql/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, MessageSquare, Paperclip, AlertCircle, AlertTriangle, ArrowUp, Minus, User, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface TicketCardProps {
  ticket: Ticket
  onClick?: () => void
  isDragging?: boolean
}

const priorityConfig = {
  urgent: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-l-destructive",
  },
  high: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-l-warning",
  },
  medium: {
    icon: ArrowUp,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-l-primary",
  },
  low: {
    icon: Minus,
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-l-muted-foreground",
  },
}

export function TicketCard({ ticket, onClick, isDragging }: TicketCardProps) {
  const priority = priorityConfig[ticket.priority] || priorityConfig.medium
  const PriorityIcon = priority.icon

  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(ticket.created_at), {
        addSuffix: true,
        locale: es,
      })
    } catch {
      return "Fecha no disponible"
    }
  }, [ticket.created_at])

  const customerName = ticket.customer ? `${ticket.customer.first_name} ${ticket.customer.last_name}`.trim() : null

  return (
    <Card
      className={cn(
        "p-3 cursor-pointer transition-all duration-200 border-l-4",
        "hover:shadow-md hover:border-primary/50",
        "bg-card",
        priority.border,
        isDragging && "shadow-lg rotate-2 opacity-90",
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm text-foreground line-clamp-2 flex-1">{ticket.title}</h4>
        <div className={cn("p-1 rounded", priority.bg)}>
          <PriorityIcon className={cn("h-3.5 w-3.5", priority.color)} />
        </div>
      </div>

      {/* Labels */}
      {ticket.labels && ticket.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {ticket.labels.slice(0, 3).map((label) => (
            <Badge
              key={label.name}
              variant="outline"
              className="text-[10px] px-1.5 py-0"
              style={{
                borderColor: label.color,
                color: label.color,
                backgroundColor: `${label.color}15`,
              }}
            >
              {label.name}
            </Badge>
          ))}
          {ticket.labels.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{ticket.labels.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Issue Type */}
      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{ticket.issue_type}</p>

      {/* Customer & Service Info */}
      <div className="space-y-1 mb-3">
        {customerName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{customerName}</span>
          </div>
        )}
        {ticket.service?.service_ip && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wifi className="h-3 w-3" />
            <span className="font-mono text-[10px]">{ticket.service.service_ip}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{timeAgo}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Comments count */}
          {ticket.comments && ticket.comments.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{ticket.comments.length}</span>
            </div>
          )}

          {/* Attachments count */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="h-3 w-3" />
              <span>{ticket.attachments.length}</span>
            </div>
          )}

          {/* Assigned Users */}
          {ticket.users && ticket.users.length > 0 && (
            <div className="flex -space-x-1.5">
              {ticket.users.slice(0, 3).map((user) => (
                <Avatar key={user.id} className="h-5 w-5 border-2 border-card">
                  <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
                    {user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {ticket.users.length > 3 && (
                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center border-2 border-card">
                  <span className="text-[8px] text-muted-foreground">+{ticket.users.length - 3}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

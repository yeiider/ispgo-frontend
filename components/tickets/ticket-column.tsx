"use client"

import type React from "react"

import type { Ticket } from "@/lib/graphql/types"
import { TicketCard } from "./ticket-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Circle, PlayCircle, CheckCircle2, XCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TicketColumnProps {
  status: "open" | "in_progress" | "resolved" | "closed"
  tickets: Ticket[]
  onTicketClick: (ticket: Ticket) => void
  onCreateTicket?: () => void
  onDragStart: (e: React.DragEvent, ticket: Ticket) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: string) => void
  draggedTicket?: Ticket | null
}

const columnConfig = {
  open: {
    title: "Abiertos",
    icon: Circle,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    headerBg: "bg-gradient-to-r from-primary/20 to-primary/5",
  },
  in_progress: {
    title: "En Progreso",
    icon: PlayCircle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
    headerBg: "bg-gradient-to-r from-warning/20 to-warning/5",
  },
  resolved: {
    title: "Resueltos",
    icon: CheckCircle2,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/30",
    headerBg: "bg-gradient-to-r from-accent/20 to-accent/5",
  },
  closed: {
    title: "Cerrados",
    icon: XCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    borderColor: "border-muted-foreground/30",
    headerBg: "bg-gradient-to-r from-muted to-muted/50",
  },
}

export function TicketColumn({
  status,
  tickets,
  onTicketClick,
  onCreateTicket,
  onDragStart,
  onDragOver,
  onDrop,
  draggedTicket,
}: TicketColumnProps) {
  const config = columnConfig[status]
  const StatusIcon = config.icon

  const isDropTarget = draggedTicket && draggedTicket.status !== status

  return (
    <div
      className={cn(
        "flex flex-col min-w-[300px] max-w-[350px] flex-1 rounded-xl border",
        "bg-secondary/30 transition-all duration-200",
        isDropTarget && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Column Header */}
      <div className={cn("p-3 rounded-t-xl", config.headerBg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-4 w-4", config.color)} />
            <h3 className="font-semibold text-sm text-foreground">{config.title}</h3>
            <Badge variant="secondary" className={cn("text-xs", config.bgColor, config.color)}>
              {tickets.length}
            </Badge>
          </div>
          {status === "open" && onCreateTicket && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCreateTicket}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <StatusIcon className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Sin tickets</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              draggable
              onDragStart={(e) => onDragStart(e, ticket)}
              className="cursor-grab active:cursor-grabbing"
            >
              <TicketCard
                ticket={ticket}
                onClick={() => onTicketClick(ticket)}
                isDragging={draggedTicket?.id === ticket.id}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

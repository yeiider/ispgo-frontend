"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import type { Ticket, TicketSearchFilters } from "@/lib/graphql/types"
import { TicketColumn } from "./ticket-column"
import { TicketDetailModal } from "./ticket-detail-modal"
import { CreateTicketModal } from "./create-ticket-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Maximize2, Minimize2, RefreshCw, Search, Plus, Filter, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTickets, updateTicket } from "@/app/actions/tickets"

interface TicketBoardProps {
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

const statusOrder = ["open", "in_progress", "resolved", "closed"] as const

export function TicketBoard({ isFullscreen, onToggleFullscreen }: TicketBoardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    try {
      const filters: TicketSearchFilters = {}
      if (searchQuery) filters.title = searchQuery
      if (priorityFilter !== "all") filters.priority = priorityFilter

      const response = await getTickets(1, 100, filters)
      setTickets(response.data)
    } catch (error) {
      console.error("Error fetching tickets:", error)
    }
  }, [searchQuery, priorityFilter])

  // Initial load
  useEffect(() => {
    setIsLoading(true)
    fetchTickets().finally(() => setIsLoading(false))
  }, [fetchTickets])

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchTickets()
    setIsRefreshing(false)
  }

  // Group tickets by status
  const ticketsByStatus = statusOrder.reduce(
    (acc, status) => {
      acc[status] = tickets.filter((t) => t.status === status)
      return acc
    },
    {} as Record<string, Ticket[]>,
  )

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, ticket: Ticket) => {
    setDraggedTicket(ticket)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()

    if (!draggedTicket || draggedTicket.status === newStatus) {
      setDraggedTicket(null)
      return
    }

    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t.id === draggedTicket.id ? { ...t, status: newStatus as Ticket["status"] } : t)),
    )

    try {
      await updateTicket({ id: draggedTicket.id, status: newStatus })
    } catch (error) {
      console.error("Error updating ticket status:", error)
      // Revert on error
      await fetchTickets()
    }

    setDraggedTicket(null)
  }

  // Ticket click handler
  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsDetailOpen(true)
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("")
    setPriorityFilter("all")
  }

  const hasActiveFilters = searchQuery || priorityFilter !== "all"

  return (
    <div className={cn("flex flex-col h-full", isFullscreen && "fixed inset-0 z-50 bg-background p-4")}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">Tablero de Tickets</h2>
          <Badge variant="secondary" className="text-sm">
            {tickets.length} tickets
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px] h-9">
              <Filter className="h-3.5 w-3.5 mr-2" />
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Refresh */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 bg-transparent"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>

          {/* Create Ticket */}
          <Button size="sm" className="h-9 gap-1.5" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Ticket</span>
          </Button>

          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent" onClick={onToggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 min-h-full pb-4">
            {statusOrder.map((status) => (
              <TicketColumn
                key={status}
                status={status}
                tickets={ticketsByStatus[status]}
                onTicketClick={handleTicketClick}
                onCreateTicket={status === "open" ? () => setIsCreateOpen(true) : undefined}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                draggedTicket={draggedTicket}
              />
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        open={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedTicket(null)
        }}
        onUpdate={() => {
          fetchTickets()
        }}
        mode={isFullscreen ? "dialog" : "sheet"}
      />

      {/* Create Modal */}
      <CreateTicketModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchTickets()
        }}
      />
    </div>
  )
}

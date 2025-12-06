"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { TicketBoard } from "@/components/tickets/ticket-board"

export default function TicketsPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (isFullscreen) {
    return <TicketBoard isFullscreen={true} onToggleFullscreen={() => setIsFullscreen(false)} />
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-120px)]">
        <TicketBoard isFullscreen={false} onToggleFullscreen={() => setIsFullscreen(true)} />
      </div>
    </MainLayout>
  )
}

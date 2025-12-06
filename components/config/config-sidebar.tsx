"use client"

import { useState, useMemo } from "react"
import type React from "react"
import {
  Settings,
  Globe,
  Bell,
  Mail,
  CreditCard,
  FileText,
  Shield,
  Users,
  Server,
  Wifi,
  Database,
  Zap,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ConfigSection } from "@/lib/graphql/types/config"

// Icon mapping for dynamic sections
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  general: Globe,
  notificaciones: Bell,
  notifications: Bell,
  email: Mail,
  smtp: Mail,
  "email-smtp": Mail,
  pago: CreditCard,
  payment: CreditCard,
  "metodos-pago": CreditCard,
  facturacion: FileText,
  billing: FileText,
  invoice: FileText,
  seguridad: Shield,
  security: Shield,
  cliente: Users,
  client: Users,
  customers: Users,
  services: Server,
  servicios: Server,
  router: Wifi,
  routers: Wifi,
  mikrotik: Wifi,
  database: Database,
  soporte: Zap,
  support: Zap,
  smartolt: Server,
  "smart-olt": Server,
  siigo: FileText,
  onepay: CreditCard,
}

function getIconForSection(key: string): React.ComponentType<{ className?: string }> {
  const normalizedKey = key.toLowerCase().replace(/[_\s]/g, "-")

  for (const [pattern, icon] of Object.entries(iconMap)) {
    if (normalizedKey.includes(pattern)) {
      return icon
    }
  }

  return Settings
}

interface ConfigSidebarProps {
  sections: ConfigSection[]
  selectedSection: string
  onSelectSection: (key: string) => void
  collapsed?: boolean
}

export function ConfigSidebar({ sections, selectedSection, onSelectSection, collapsed = false }: ConfigSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Memoize icons for each section
  const sectionIcons = useMemo(() => {
    return sections.reduce(
      (acc, section) => {
        acc[section.key] = getIconForSection(section.key)
        return acc
      },
      {} as Record<string, React.ComponentType<{ className?: string }>>,
    )
  }, [sections])

  if (sections.length === 0) {
    return null
  }

  return (
    <div className="h-full bg-card border-r border-border">
      <ScrollArea className="h-full">
        <div className="py-2">
          {/* Main Configuration Header */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
              <Settings className="h-4 w-4 text-muted-foreground" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">Configuración</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </>
              )}
            </CollapsibleTrigger>

            <CollapsibleContent>
              <nav className="space-y-0.5 px-2 py-1">
                {sections.map((section) => {
                  const Icon = sectionIcons[section.key]
                  const isSelected = selectedSection === section.key

                  return (
                    <button
                      key={section.key}
                      onClick={() => onSelectSection(section.key)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150",
                        isSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn("h-4 w-4 flex-shrink-0", isSelected ? "text-primary" : "text-muted-foreground")}
                      />
                      {!collapsed && <span className="truncate">{section.label}</span>}
                    </button>
                  )
                })}
              </nav>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  )
}

"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  Scissors,
  MapPin,
  Wrench,
  Settings,
  ChevronDown,
  ChevronRight,
  Wifi,
  Server,
  CreditCard,
  UserPlus,
  FileSpreadsheet,
  AlertTriangle,
  Calendar,
  Home,
  Building2,
  Network,
  Ticket,
  Activity,
  BarChart3,
  UserCog,
  HelpCircle,
  Shield,
  Plus,

} from "lucide-react"

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  badge?: string | number
  badgeColor?: "default" | "warning" | "destructive" | "accent"
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    href: "/",
  },
  {
    id: "tickets",
    label: "Tickets / Soporte",
    icon: <Ticket className="h-4 w-4" />,
    href: "/tickets",
    badge: "Nuevo",
    badgeColor: "accent",
  },
  {
    id: "network",
    label: "Monitoreo de Red",
    icon: <Activity className="h-4 w-4" />,
    children: [
      { id: "network-status", label: "Estado de Red", icon: <Network className="h-4 w-4" />, href: "/network/status" },
      { id: "network-nodes", label: "Nodos", icon: <Server className="h-4 w-4" />, href: "/network/nodes", badge: 24 },
      {
        id: "network-bandwidth",
        label: "Ancho de Banda",
        icon: <BarChart3 className="h-4 w-4" />,
        href: "/network/bandwidth",
      },
    ],
  },
  {
    id: "routers",
    label: "Routers",
    icon: <Server className="h-4 w-4" />,
    children: [
      { id: "routers-list", label: "Lista de Routers", icon: <Server className="h-4 w-4" />, href: "/routers" },
      { id: "routers-new", label: "Nuevo Router", icon: <Plus className="h-4 w-4" />, href: "/routers/new" },
    ],
  },
  {
    id: "plans",
    label: "Planes",
    icon: <CreditCard className="h-4 w-4" />,
    children: [
      { id: "plans-list", label: "Lista de Planes", icon: <CreditCard className="h-4 w-4" />, href: "/plans" },
      { id: "plans-new", label: "Nuevo Plan", icon: <Plus className="h-4 w-4" />, href: "/plans/new" },
    ],
  },
  {
    id: "clients",
    label: "Clientes",
    icon: <Users className="h-4 w-4" />,
    badge: "2.4K",
    children: [
      { id: "clients-list", label: "Lista de Clientes", icon: <Users className="h-4 w-4" />, href: "/clients" },
      { id: "clients-new", label: "Nuevo Cliente", icon: <UserPlus className="h-4 w-4" />, href: "/clients/new" },
      {
        id: "clients-segments",
        label: "Segmentos",
        icon: <Building2 className="h-4 w-4" />,
        href: "/clients/segments",
      },
    ],
  },
  {
    id: "services",
    label: "Servicios",
    icon: <Wifi className="h-4 w-4" />,
    children: [
      {
        id: "services-list",
        label: "Todos los Servicios",
        icon: <Wifi className="h-4 w-4" />,
        href: "/services",
      },
      {
        id: "services-new",
        label: "Nuevo Servicio",
        icon: <Wifi className="h-4 w-4" />,
        href: "/services/new",
      },
      {
        id: "services-plans",
        label: "Planes de Internet",
        icon: <Wifi className="h-4 w-4" />,
        href: "/services/plans",
      },
    ],
  },
  {
    id: "billing",
    label: "Facturación",
    icon: <FileText className="h-4 w-4" />,
    children: [
      {
        id: "billing-invoices",
        label: "Facturas",
        icon: <FileSpreadsheet className="h-4 w-4" />,
        href: "/billing/invoices",
      },
      { id: "billing-payments", label: "Pagos", icon: <CreditCard className="h-4 w-4" />, href: "/billing/payments" },
      {
        id: "billing-pending",
        label: "Pendientes",
        icon: <AlertTriangle className="h-4 w-4" />,
        href: "/billing/pending",
        badge: 156,
        badgeColor: "destructive",
      },
      { id: "billing-reports", label: "Reportes", icon: <BarChart3 className="h-4 w-4" />, href: "/billing/reports" },
    ],
  },
  {
    id: "cuts",
    label: "Cortes de Servicio",
    icon: <Scissors className="h-4 w-4" />,
    badge: 45,
    badgeColor: "warning",
    children: [
      { id: "cuts-scheduled", label: "Programados", icon: <Calendar className="h-4 w-4" />, href: "/cuts/scheduled" },
      { id: "cuts-executed", label: "Ejecutados", icon: <Scissors className="h-4 w-4" />, href: "/cuts/executed" },
      {
        id: "cuts-reconnections",
        label: "Reconexiones",
        icon: <Wifi className="h-4 w-4" />,
        href: "/cuts/reconnections",
      },
    ],
  },
  {
    id: "locations",
    label: "Direcciones",
    icon: <MapPin className="h-4 w-4" />,
    children: [
      {
        id: "locations-zones",
        label: "Zonas de Cobertura",
        icon: <MapPin className="h-4 w-4" />,
        href: "/locations/zones",
      },
      {
        id: "locations-addresses",
        label: "Direcciones",
        icon: <Home className="h-4 w-4" />,
        href: "/locations/addresses",
      },
    ],
  },
  {
    id: "installations",
    label: "Instalaciones",
    icon: <Wrench className="h-4 w-4" />,
    children: [
      {
        id: "installations-pending",
        label: "Pendientes",
        icon: <Calendar className="h-4 w-4" />,
        href: "/installations/pending",
        badge: 12,
      },
      {
        id: "installations-scheduled",
        label: "Programadas",
        icon: <Calendar className="h-4 w-4" />,
        href: "/installations/scheduled",
      },
      {
        id: "installations-completed",
        label: "Completadas",
        icon: <Wrench className="h-4 w-4" />,
        href: "/installations/completed",
      },
      {
        id: "installations-technicians",
        label: "Técnicos",
        icon: <Users className="h-4 w-4" />,
        href: "/installations/technicians",
      },
    ],
  },
  {
    id: "users",
    label: "Usuarios y Accesos",
    icon: <UserCog className="h-4 w-4" />,
    children: [
      { id: "users-list", label: "Lista de Usuarios", icon: <Users className="h-4 w-4" />, href: "/users" },
      { id: "users-roles", label: "Roles y Permisos", icon: <Shield className="h-4 w-4" />, href: "/users/roles" },
    ],
  },
]

const bottomItems: NavItem[] = [
  {
    id: "settings",
    label: "Configuración",
    icon: <Settings className="h-4 w-4" />,
    href: "/settings",
  },
  { id: "help", label: "Ayuda", icon: <HelpCircle className="h-4 w-4" />, href: "/help" },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["clients", "services", "billing", "plans", "settings"])

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === "/") return pathname === "/"
    if (href.includes("?")) {
      return pathname === href.split("?")[0]
    }
    return pathname.startsWith(href)
  }

  const getBadgeClasses = (color?: string) => {
    const base = "ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full"
    switch (color) {
      case "warning":
        return cn(base, "bg-warning/20 text-warning")
      case "destructive":
        return cn(base, "bg-destructive/20 text-destructive")
      case "accent":
        return cn(base, "bg-accent/20 text-accent")
      default:
        return cn(base, "bg-primary/20 text-primary")
    }
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const active = isActive(item.href)

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleExpanded(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
              "hover:bg-secondary/80",
              level > 0 && "ml-4 pl-4 border-l border-border",
              "text-muted-foreground hover:text-foreground",
            )}
          >
            <span>{item.icon}</span>
            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badge && <span className={getBadgeClasses(item.badgeColor)}>{item.badge}</span>}
                <span className="text-muted-foreground">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </span>
              </>
            )}
          </button>
          {isExpanded && !collapsed && (
            <div className="mt-1 space-y-1">{item.children!.map((child) => renderNavItem(child, level + 1))}</div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.id}
        href={item.href || "#"}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
          "hover:bg-secondary/80",
          level > 0 && "ml-4 pl-4 border-l border-border",
          active && "bg-primary/10 text-primary border-l-2 border-primary",
          !active && "text-muted-foreground hover:text-foreground",
        )}
      >
        <span className={cn(active && "text-primary")}>{item.icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {item.badge && <span className={getBadgeClasses(item.badgeColor)}>{item.badge}</span>}
          </>
        )}
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Wifi className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-foreground">NetCore</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ISP Manager</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigationItems.map((item) => renderNavItem(item))}
      </nav>

      {/* Bottom Items */}
      <div className="border-t border-border py-4 px-3 space-y-1">{bottomItems.map((item) => renderNavItem(item))}</div>
    </aside>
  )
}

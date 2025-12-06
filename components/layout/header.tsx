"use client"
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  Settings,
  LogOut,
  User,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth/auth-provider"
import { getInitials, getRoleBadgeColor } from "@/lib/auth"

interface HeaderProps {
  onMenuToggle?: () => void
}

const notifications = [
  {
    id: 1,
    type: "alert",
    title: "Nodo Sector Norte sin respuesta",
    description: "El nodo principal del sector norte no responde hace 5 minutos",
    time: "Hace 5 min",
    read: false,
  },
  {
    id: 2,
    type: "warning",
    title: "45 cortes programados para hoy",
    description: "Se ejecutarán cortes por falta de pago",
    time: "Hace 1 hora",
    read: false,
  },
  {
    id: 3,
    type: "success",
    title: "Instalación completada",
    description: "Técnico Juan completó instalación en Av. Principal 123",
    time: "Hace 2 horas",
    read: true,
  },
  {
    id: 4,
    type: "info",
    title: "Nuevo cliente registrado",
    description: "María García se ha registrado como nuevo cliente",
    time: "Hace 3 horas",
    read: true,
  },
]

const networkStatus = {
  status: "operational",
  uptime: "99.97%",
  activeNodes: 24,
  totalNodes: 25,
  bandwidth: "847 Gbps",
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth()
  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <WifiOff className="h-4 w-4 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-accent" />
      default:
        return <Bell className="h-4 w-4 text-primary" />
    }
  }

  const userName = user?.name || "Usuario"
  const userRole = user?.role || "Sin rol"
  const userInitials = user ? getInitials(user.name) : "U"

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuToggle}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Network Status Indicator */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                networkStatus.status === "operational" ? "bg-accent" : "bg-destructive",
              )}
            />
            <span className="text-xs font-medium text-muted-foreground">Red</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-mono text-foreground">{networkStatus.uptime}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Nodos:</span>
            <span className="text-xs font-mono text-foreground">
              {networkStatus.activeNodes}/{networkStatus.totalNodes}
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">BW:</span>
            <span className="text-xs font-mono text-primary">{networkStatus.bandwidth}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes, facturas, servicios..."
            className="pl-9 bg-secondary/50 border-border focus:bg-card"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Mobile Search */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificaciones</span>
              <Badge variant="secondary" className="text-xs">
                {unreadCount} nuevas
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn("flex items-start gap-3 p-3 cursor-pointer", !notification.read && "bg-primary/5")}
                >
                  <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 space-y-1">
                    <p className={cn("text-sm", !notification.read && "font-medium")}>{notification.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.description}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && <div className="w-2 h-2 rounded-full bg-primary mt-1" />}
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-primary text-sm justify-center">
              Ver todas las notificaciones
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">{userInitials}</span>
              </div>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-medium">{userName}</span>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded", getRoleBadgeColor(userRole))}>{userRole}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{userName}</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

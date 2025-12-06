// Tipos para autenticación con Laravel Passport
export interface AuthTokens {
  token_type: string
  expires_in: number
  access_token: string
  refresh_token: string
}

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  two_factor_secret: string | null
  two_factor_recovery_codes: string | null
  two_factor_confirmed_at: string | null
  telephone: string | null
  router_id: number | null
  created_by: number | null
  updated_by: number | null
  created_at: string
  updated_at: string
  // Campos opcionales que pueden venir de relaciones
  role?: string
  roles?: Array<{ id: number; name: string }>
  avatar?: string
  permissions?: string[]
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Función para obtener las iniciales del nombre
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Función para obtener el color del rol
export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    admin: "bg-primary text-primary-foreground",
    administrador: "bg-primary text-primary-foreground",
    tecnico: "bg-accent text-accent-foreground",
    technician: "bg-accent text-accent-foreground",
    soporte: "bg-blue-500 text-white",
    support: "bg-blue-500 text-white",
    ventas: "bg-amber-500 text-white",
    sales: "bg-amber-500 text-white",
    viewer: "bg-muted text-muted-foreground",
  }
  return colors[role.toLowerCase()] || "bg-secondary text-secondary-foreground"
}

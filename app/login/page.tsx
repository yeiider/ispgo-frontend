"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Wifi,
  Eye,
  EyeOff,
  Network,
  Activity,
  Signal,
  Lock,
  Mail,
  ArrowRight,
  Globe,
  Server,
  Zap,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ThemeToggle } from "@/components/theme-toggle"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login } from "@/app/actions/auth"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await login({
      username: email,
      password: password,
    })

    if (result.success) {
      router.push("/")
      router.refresh()
    } else {
      setError(result.error || "Error al iniciar sesión")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/10">
        {/* Animated Network Grid Background */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-primary/30"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating Network Nodes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-accent rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-primary/60 rounded-full animate-pulse delay-500" />
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-accent/80 rounded-full animate-pulse delay-700" />
          <div className="absolute bottom-1/3 right-1/2 w-3 h-3 bg-primary/40 rounded-full animate-pulse delay-1000" />

          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full">
            <line
              x1="25%"
              y1="25%"
              x2="66%"
              y2="33%"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary/20"
            />
            <line
              x1="66%"
              y1="33%"
              x2="75%"
              y2="50%"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary/20"
            />
            <line
              x1="33%"
              y1="75%"
              x2="50%"
              y2="66%"
              stroke="currentColor"
              strokeWidth="1"
              className="text-accent/20"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo & Title */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Wifi className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">NetCore ISP</h1>
                <p className="text-sm text-muted-foreground">Sistema de Gestión</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Gestiona tu red con inteligencia</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Plataforma integral para proveedores de internet. Controla clientes, facturación, instalaciones y
                monitoreo en tiempo real.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FeatureCard
                icon={<Network className="w-5 h-5" />}
                title="Monitoreo de Red"
                description="Visualiza el estado de tu infraestructura"
              />
              <FeatureCard
                icon={<Activity className="w-5 h-5" />}
                title="Tiempo Real"
                description="Métricas y alertas instantáneas"
              />
              <FeatureCard
                icon={<Server className="w-5 h-5" />}
                title="Multi-Nodo"
                description="Gestiona múltiples puntos de acceso"
              />
              <FeatureCard
                icon={<Zap className="w-5 h-5" />}
                title="Automatización"
                description="Cortes y reconexiones automáticas"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8">
            <div>
              <p className="text-3xl font-bold text-primary">99.9%</p>
              <p className="text-sm text-muted-foreground">Uptime garantizado</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div>
              <p className="text-3xl font-bold text-accent">+500</p>
              <p className="text-sm text-muted-foreground">ISPs activos</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div>
              <p className="text-3xl font-bold text-foreground">24/7</p>
              <p className="text-sm text-muted-foreground">Soporte técnico</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <Wifi className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">NetCore ISP</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestión</p>
            </div>
          </div>

          {/* Welcome */}
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Bienvenido de nuevo</h2>
            <p className="text-muted-foreground">Ingresa tus credenciales para acceder al panel de control</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@tuisp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">
                  Contraseña
                </Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-secondary/50 border-border focus:border-primary"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Mantener sesión iniciada
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Ingresando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Iniciar sesión
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">O continúa con</span>
            </div>
          </div>

          {/* SSO Options */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 border-border hover:bg-secondary bg-transparent"
              disabled={isLoading}
            >
              <Globe className="w-5 h-5 mr-2" />
              Microsoft
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 border-border hover:bg-secondary bg-transparent"
              disabled={isLoading}
            >
              <Signal className="w-5 h-5 mr-2" />
              Google
            </Button>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Contacta a ventas
            </Link>
          </p>

          {/* Network Status Indicator */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Sistema operativo</span>
            </div>
            <span className="text-border">•</span>
            <span>v3.2.1</span>
            <span className="text-border">•</span>
            <span>Latencia: 12ms</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

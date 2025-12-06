"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Wifi, CreditCard, Save, X, Upload, Calendar, Globe, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  { id: "fiber-50", name: "Fibra 50 Mbps", price: 299, speed: "50/25 Mbps" },
  { id: "fiber-100", name: "Fibra 100 Mbps", price: 449, speed: "100/50 Mbps" },
  { id: "fiber-200", name: "Fibra 200 Mbps", price: 649, speed: "200/100 Mbps" },
  { id: "fiber-300", name: "Fibra 300 Mbps", price: 899, speed: "300/150 Mbps" },
  { id: "fiber-500", name: "Fibra 500 Mbps", price: 1199, speed: "500/250 Mbps" },
]

const zones = [
  { id: "north", name: "Sector Norte", coverage: "95%" },
  { id: "south", name: "Sector Sur", coverage: "88%" },
  { id: "east", name: "Sector Este", coverage: "92%" },
  { id: "west", name: "Sector Oeste", coverage: "90%" },
  { id: "center", name: "Sector Centro", coverage: "98%" },
]

export function ClientForm() {
  const [selectedPlan, setSelectedPlan] = useState("")
  const [activeTab, setActiveTab] = useState("personal")

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Nuevo Cliente
            </CardTitle>
            <CardDescription>Complete la información para registrar un nuevo cliente</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="h-4 w-4" />
              Guardar Cliente
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="personal" className="gap-2 data-[state=active]:bg-card">
              <User className="h-4 w-4" />
              Datos Personales
            </TabsTrigger>
            <TabsTrigger value="address" className="gap-2 data-[state=active]:bg-card">
              <MapPin className="h-4 w-4" />
              Dirección
            </TabsTrigger>
            <TabsTrigger value="service" className="gap-2 data-[state=active]:bg-card">
              <Wifi className="h-4 w-4" />
              Servicio
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2 data-[state=active]:bg-card">
              <CreditCard className="h-4 w-4" />
              Facturación
            </TabsTrigger>
          </TabsList>

          {/* Personal Data Tab */}
          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label className="text-sm font-medium mb-2 block">Foto del Cliente</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border-2 border-dashed border-border">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Upload className="h-4 w-4" />
                    Subir Foto
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  Nombre(s) <span className="text-destructive">*</span>
                </Label>
                <Input id="firstName" placeholder="Ej: María Elena" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Apellidos <span className="text-destructive">*</span>
                </Label>
                <Input id="lastName" placeholder="Ej: García López" className="bg-secondary/50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo Electrónico <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="correo@ejemplo.com" className="pl-9 bg-secondary/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Teléfono <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" type="tel" placeholder="+52 555 123 4567" className="pl-9 bg-secondary/50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idType" className="text-sm font-medium">
                  Tipo de Documento
                </Label>
                <Select>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ine">INE/IFE</SelectItem>
                    <SelectItem value="passport">Pasaporte</SelectItem>
                    <SelectItem value="license">Licencia de Conducir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idNumber" className="text-sm font-medium">
                  Número de Documento
                </Label>
                <Input id="idNumber" placeholder="XXXX-XXXX-XXXX" className="bg-secondary/50" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notas Adicionales
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Información adicional sobre el cliente..."
                  className="bg-secondary/50 min-h-[100px]"
                />
              </div>
            </div>
          </TabsContent>

          {/* Address Tab */}
          <TabsContent value="address" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="street" className="text-sm font-medium">
                  Calle y Número <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="street" placeholder="Av. Principal #123" className="pl-9 bg-secondary/50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood" className="text-sm font-medium">
                  Colonia <span className="text-destructive">*</span>
                </Label>
                <Input id="neighborhood" placeholder="Col. Centro" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  Ciudad <span className="text-destructive">*</span>
                </Label>
                <Input id="city" placeholder="Ciudad de México" className="bg-secondary/50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-sm font-medium">
                  Código Postal <span className="text-destructive">*</span>
                </Label>
                <Input id="zipCode" placeholder="12345" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone" className="text-sm font-medium">
                  Zona de Cobertura <span className="text-destructive">*</span>
                </Label>
                <Select>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Seleccionar zona" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{zone.name}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {zone.coverage}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-sm font-medium">
                  Latitud
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="latitude" placeholder="19.4326" className="pl-9 bg-secondary/50 font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-sm font-medium">
                  Longitud
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="longitude" placeholder="-99.1332" className="pl-9 bg-secondary/50 font-mono" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Service Tab */}
          <TabsContent value="service" className="space-y-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                Seleccionar Plan de Internet <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                      selectedPlan === plan.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 bg-secondary/30",
                    )}
                  >
                    {selectedPlan === plan.id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Wifi
                          className={cn("h-5 w-5", selectedPlan === plan.id ? "text-primary" : "text-muted-foreground")}
                        />
                        <span className="font-semibold">{plan.name}</span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        ${plan.price}
                        <span className="text-sm font-normal text-muted-foreground">/mes</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Velocidad: {plan.speed}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="installDate" className="text-sm font-medium">
                  Fecha de Instalación
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="installDate" type="date" className="pl-9 bg-secondary/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="installTime" className="text-sm font-medium">
                  Horario Preferido
                </Label>
                <Select>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Seleccionar horario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Mañana (9:00 - 12:00)</SelectItem>
                    <SelectItem value="afternoon">Tarde (12:00 - 15:00)</SelectItem>
                    <SelectItem value="evening">Tarde (15:00 - 18:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <Label className="text-sm font-medium">Servicios Adicionales</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Antivirus Premium</p>
                      <p className="text-xs text-muted-foreground">Protección para hasta 5 dispositivos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">+$49/mes</span>
                    <Switch />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">IP Pública Fija</p>
                      <p className="text-xs text-muted-foreground">IP estática dedicada</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">+$99/mes</span>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="billingType" className="text-sm font-medium">
                  Tipo de Facturación <span className="text-destructive">*</span>
                </Label>
                <Select>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Persona Física</SelectItem>
                    <SelectItem value="company">Persona Moral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-sm font-medium">
                  Método de Pago Preferido
                </Label>
                <Select>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                    <SelectItem value="card">Tarjeta de Crédito/Débito</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="oxxo">OXXO Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rfc" className="text-sm font-medium">
                  RFC
                </Label>
                <Input id="rfc" placeholder="XAXX010101000" className="bg-secondary/50 font-mono uppercase" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingEmail" className="text-sm font-medium">
                  Email para Facturación
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="billingEmail"
                    type="email"
                    placeholder="facturacion@ejemplo.com"
                    className="pl-9 bg-secondary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cutDay" className="text-sm font-medium">
                  Día de Corte
                </Label>
                <Select>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Seleccionar día" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 5, 10, 15, 20, 25].map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Día {day} de cada mes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDue" className="text-sm font-medium">
                  Días para Pago
                </Label>
                <Select>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 días</SelectItem>
                    <SelectItem value="10">10 días</SelectItem>
                    <SelectItem value="15">15 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Domiciliación de Pagos</p>
                      <p className="text-sm text-muted-foreground">
                        Cargo automático mensual a tarjeta de crédito/débito
                      </p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

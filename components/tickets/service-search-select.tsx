"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Check, ChevronsUpDown, Search, Wifi, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { getServices } from "@/app/actions/services"
import type { Service } from "@/lib/graphql/types"

interface ServiceSearchSelectProps {
  value?: string
  onSelect: (service: Service | null) => void
  selectedService?: Service | null
  customerId?: string // Optional: filter services by customer
}

export function ServiceSearchSelect({ value, onSelect, selectedService, customerId }: ServiceSearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch services when search changes
  const fetchServices = useCallback(async () => {
    if (!open) return

    setLoading(true)
    try {
      const result = await getServices(1, 10, {
        service_ip: debouncedSearch || undefined,
        sn: debouncedSearch || undefined,
      })
      if (result.success && result.data) {
        // Filter by customer if customerId is provided
        let filteredServices = result.data.data
        if (customerId) {
          filteredServices = filteredServices.filter((s) => s.customer?.id === customerId)
        }
        setServices(filteredServices)
      }
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, open, customerId])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const handleSelect = (service: Service) => {
    onSelect(service)
    setOpen(false)
    setSearch("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(null)
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "suspended":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "active":
        return "Activo"
      case "suspended":
        return "Suspendido"
      case "cancelled":
        return "Cancelado"
      default:
        return status || "Desconocido"
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10 bg-transparent"
        >
          {selectedService ? (
            <div className="flex items-center gap-2 flex-1 text-left">
              <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Wifi className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium truncate">{selectedService.service_ip || "Sin IP"}</span>
                <span className="text-xs text-muted-foreground truncate">
                  SN: {selectedService.sn || "N/A"} • {selectedService.plan?.name || "Sin plan"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 ml-auto hover:bg-destructive/10"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <span className="text-muted-foreground">Buscar servicio...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Buscar por IP, SN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
          </div>
          <CommandList>
            <CommandEmpty>{loading ? "Buscando..." : "No se encontraron servicios."}</CommandEmpty>
            <CommandGroup>
              {services.map((service) => (
                <CommandItem
                  key={service.id}
                  value={service.id}
                  onSelect={() => handleSelect(service)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Wifi className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium">{service.service_ip || "Sin IP asignada"}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>SN: {service.sn || "N/A"}</span>
                        {service.plan?.name && (
                          <>
                            <span>•</span>
                            <span>{service.plan.name}</span>
                          </>
                        )}
                        {service.customer && (
                          <>
                            <span>•</span>
                            <span className="truncate">
                              {service.customer.first_name} {service.customer.last_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("ml-auto text-[10px]", getStatusColor(service.service_status))}
                    >
                      {getStatusLabel(service.service_status)}
                    </Badge>
                  </div>
                  <Check className={cn("ml-2 h-4 w-4", value === service.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

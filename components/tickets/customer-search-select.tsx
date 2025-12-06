"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Check, ChevronsUpDown, Search, User, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { getCustomers } from "@/app/actions/customers"
import type { Customer } from "@/lib/graphql/types"

interface CustomerSearchSelectProps {
  value?: string
  onSelect: (customer: Customer | null) => void
  selectedCustomer?: Customer | null
}

export function CustomerSearchSelect({ value, onSelect, selectedCustomer }: CustomerSearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch customers when search changes
  const fetchCustomers = useCallback(async () => {
    if (!open) return

    setLoading(true)
    try {
      const result = await getCustomers(1, 10, { search: debouncedSearch || undefined })
      if (result.success && result.data) {
        setCustomers(result.data.data)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, open])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleSelect = (customer: Customer) => {
    onSelect(customer)
    setOpen(false)
    setSearch("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(null)
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
          {selectedCustomer ? (
            <div className="flex items-center gap-2 flex-1 text-left">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium truncate">
                  {selectedCustomer.first_name} {selectedCustomer.last_name}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {selectedCustomer.identity_document} • {selectedCustomer.email_address || "Sin email"}
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
            <span className="text-muted-foreground">Buscar cliente...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Buscar por nombre, documento, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
          </div>
          <CommandList>
            <CommandEmpty>{loading ? "Buscando..." : "No se encontraron clientes."}</CommandEmpty>
            <CommandGroup>
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={customer.id}
                  onSelect={() => handleSelect(customer)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium">
                        {customer.first_name} {customer.last_name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{customer.identity_document}</span>
                        {customer.email_address && (
                          <>
                            <span>•</span>
                            <span className="truncate">{customer.email_address}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={customer.customer_status === "active" ? "default" : "secondary"}
                      className="ml-auto text-[10px]"
                    >
                      {customer.customer_status === "active" ? "Activo" : customer.customer_status}
                    </Badge>
                  </div>
                  <Check className={cn("ml-2 h-4 w-4", value === customer.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

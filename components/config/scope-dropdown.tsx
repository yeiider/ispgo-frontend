"use client"

import { Check, ChevronDown, Globe, Router } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Router as RouterType } from "@/lib/graphql/types"

interface ScopeDropdownProps {
  currentScope: number
  routers: RouterType[]
  onScopeChange: (scopeId: number) => void
  hasUnsavedChanges?: boolean
}

export function ScopeDropdown({ currentScope, routers, onScopeChange, hasUnsavedChanges }: ScopeDropdownProps) {
  const handleScopeChange = (scopeId: number) => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm("Hay cambios sin guardar. ¿Desea cambiar de scope y perder los cambios?")
      if (!confirm) return
    }
    onScopeChange(scopeId)
  }

  const getScopeName = () => {
    if (currentScope === 0) return "Default Config"
    const router = routers.find((r) => Number(r.id) === currentScope)
    return router?.name || `Router ${currentScope}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[200px] justify-between gap-2 h-9 bg-card">
          <div className="flex items-center gap-2">
            {currentScope === 0 ? (
              <Globe className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Router className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="truncate">{getScopeName()}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Selecciona un scope</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Global/Default option */}
        <DropdownMenuItem
          onClick={() => handleScopeChange(0)}
          className={cn("cursor-pointer gap-2", currentScope === 0 && "bg-primary/10")}
        >
          <Globe className="h-4 w-4" />
          <span className="flex-1">Default Config</span>
          {currentScope === 0 && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        {routers.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Routers</DropdownMenuLabel>
            {routers.map((router) => (
              <DropdownMenuItem
                key={router.id}
                onClick={() => handleScopeChange(Number(router.id))}
                className={cn("cursor-pointer gap-2", currentScope === Number(router.id) && "bg-primary/10")}
              >
                <Router className="h-4 w-4" />
                <span className="flex-1 truncate">{router.name}</span>
                {currentScope === Number(router.id) && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

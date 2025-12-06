"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Save, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfigSidebar } from "./config-sidebar"
import { ConfigContent } from "./config-content"
import { ScopeDropdown } from "./scope-dropdown"
import { getConfigSchema, getConfigFields, saveConfigValues } from "@/app/actions/config"
import { getAllRouters } from "@/app/actions/routers"
import type { ConfigSection, ConfigItemInput } from "@/lib/graphql/types/config"
import type { Router } from "@/lib/graphql/types"
import { cn } from "@/lib/utils"

export function ConfigManager() {
  const [schema, setSchema] = useState<ConfigSection[]>([])
  const [routers, setRouters] = useState<Router[]>([])
  const [currentScope, setCurrentScope] = useState(0)
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [values, setValues] = useState<Record<string, string>>({})
  const [changedPaths, setChangedPaths] = useState<Set<string>>(new Set())
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch schema and routers on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [schemaResult, routersResult] = await Promise.all([getConfigSchema(), getAllRouters()])

        if (schemaResult.success && schemaResult.data) {
          setSchema(schemaResult.data)
          if (schemaResult.data.length > 0) {
            setSelectedSection(schemaResult.data[0].key)
            // Open all groups by default
            const allGroups = new Set<string>()
            schemaResult.data.forEach((section) => {
              section.groups?.forEach((group) => {
                allGroups.add(`${section.key}/${group.key}`)
              })
            })
            setOpenGroups(allGroups)
          }
        } else {
          setError(schemaResult.error || "Error al cargar el esquema")
        }

        if (routersResult.success && routersResult.data) {
          setRouters(routersResult.data)
        }
      } catch (err) {
        setError("Error al cargar la configuración")
        console.error("[v0] Error loading initial data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Fetch values when scope changes
  const fetchValues = useCallback(async () => {
    if (schema.length === 0) return

    setLoading(true)
    setError(null)
    try {
      const result = await getConfigFields(currentScope)
      if (result.success && result.data) {
        const newValues: Record<string, string> = {}
        result.data.forEach((field) => {
          // Use value if set, otherwise use default
          if (field.value !== null && field.value !== undefined) {
            newValues[field.path] = field.value
          } else if (field.default !== null && field.default !== undefined) {
            newValues[field.path] = field.default
          }
        })
        setValues(newValues)
        setChangedPaths(new Set())
      } else {
        setError(result.error || "Error al cargar valores")
      }
    } catch (err) {
      setError("Error al cargar valores de configuración")
      console.error("[v0] Error loading values:", err)
    } finally {
      setLoading(false)
    }
  }, [currentScope, schema.length])

  useEffect(() => {
    if (schema.length > 0) {
      fetchValues()
    }
  }, [currentScope, schema.length, fetchValues])

  const handleChange = (path: string, value: string) => {
    setValues((prev) => ({ ...prev, [path]: value }))
    setChangedPaths((prev) => new Set(prev).add(path))
  }

  const handleScopeChange = (scopeId: number) => {
    setCurrentScope(scopeId)
    setChangedPaths(new Set())
  }

  const handleSave = async () => {
    if (changedPaths.size === 0) return

    setSaving(true)
    setError(null)

    try {
      const items: ConfigItemInput[] = Array.from(changedPaths).map((path) => ({
        path,
        value: values[path] || null,
      }))

      const result = await saveConfigValues(items, currentScope)
      if (result.success) {
        setChangedPaths(new Set())
      } else {
        setError(result.error || "Error al guardar configuración")
      }
    } catch (err) {
      setError("Error al guardar la configuración")
    } finally {
      setSaving(false)
    }
  }

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
      } else {
        newSet.add(groupKey)
      }
      return newSet
    })
  }

  // Get current section data
  const currentSection = useMemo(() => {
    return schema.find((s) => s.key === selectedSection) || null
  }, [schema, selectedSection])

  // Loading state - initial load
  if (loading && schema.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">Configuración</h1>
          {changedPaths.size > 0 && (
            <Badge variant="secondary" className="bg-primary/15 text-primary border-0">
              {changedPaths.size} cambio{changedPaths.size !== 1 ? "s" : ""} sin guardar
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Scope Selector */}
          <ScopeDropdown
            currentScope={currentScope}
            routers={routers}
            onScopeChange={handleScopeChange}
            hasUnsavedChanges={changedPaths.size > 0}
          />

          {/* Refresh Button */}
          <Button variant="ghost" size="icon" onClick={fetchValues} disabled={loading} className="h-9 w-9">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={saving || changedPaths.size === 0} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Config Sidebar */}
        <div className="w-56 flex-shrink-0 overflow-hidden">
          <ConfigSidebar sections={schema} selectedSection={selectedSection} onSelectSection={setSelectedSection} />
        </div>

        {/* Config Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <ConfigContent
              section={currentSection}
              values={values}
              onChange={handleChange}
              openGroups={openGroups}
              onToggleGroup={toggleGroup}
              disabled={saving}
              changedPaths={changedPaths}
            />
          )}
        </div>
      </div>
    </div>
  )
}

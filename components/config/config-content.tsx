"use client"

import { ChevronDown, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DynamicField } from "./dynamic-field"
import type { ConfigSection, ConfigGroup, ConfigField } from "@/lib/graphql/types/config"

interface ConfigContentProps {
  section: ConfigSection | null
  values: Record<string, string>
  onChange: (path: string, value: string) => void
  openGroups: Set<string>
  onToggleGroup: (groupKey: string) => void
  disabled?: boolean
  changedPaths: Set<string>
}

function FieldRow({
  field,
  value,
  onChange,
  disabled,
  isChanged,
}: {
  field: ConfigField
  value: string
  onChange: (path: string, value: string) => void
  disabled?: boolean
  isChanged: boolean
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[220px_1fr] gap-6 px-5 py-4 items-start",
        "border-b border-border/50 last:border-b-0",
        isChanged && "bg-primary/5",
      )}
    >
      <div className="flex items-start gap-2 pt-2">
        <label className="text-sm text-muted-foreground leading-tight">{field.label}</label>
        {isChanged && <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 mt-1" />}
      </div>
      <div className="min-w-0">
        <DynamicField field={field} value={value} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  )
}

function GroupCard({
  group,
  sectionKey,
  values,
  onChange,
  isOpen,
  onToggle,
  disabled,
  changedPaths,
}: {
  group: ConfigGroup
  sectionKey: string
  values: Record<string, string>
  onChange: (path: string, value: string) => void
  isOpen: boolean
  onToggle: () => void
  disabled?: boolean
  changedPaths: Set<string>
}) {
  const changedCount = group.fields?.filter((f) => changedPaths.has(f.path)).length || 0

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="w-full">
        <div
          className={cn(
            "flex items-center justify-between px-5 py-3.5",
            "bg-muted/30 hover:bg-muted/50 transition-colors rounded-t-lg",
            !isOpen && "rounded-b-lg",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">{group.label}</span>
            {changedCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary/15 text-primary text-xs font-medium">
                {changedCount}
              </span>
            )}
          </div>
          <ChevronDown
            className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="bg-card border-x border-b border-border rounded-b-lg overflow-hidden">
          {group.fields?.map((field) => (
            <FieldRow
              key={field.path}
              field={field}
              value={values[field.path] ?? field.default ?? ""}
              onChange={onChange}
              disabled={disabled}
              isChanged={changedPaths.has(field.path)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function ConfigContent({
  section,
  values,
  onChange,
  openGroups,
  onToggleGroup,
  disabled,
  changedPaths,
}: ConfigContentProps) {
  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">Seleccione una sección para ver las configuraciones</p>
      </div>
    )
  }

  if (!section.groups || section.groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">Esta sección no tiene configuraciones disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">{section.label}</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure los parámetros de {section.label.toLowerCase()}</p>
      </div>

      {/* Groups */}
      {section.groups.map((group) => {
        const groupKey = `${section.key}/${group.key}`
        return (
          <GroupCard
            key={group.key}
            group={group}
            sectionKey={section.key}
            values={values}
            onChange={onChange}
            isOpen={openGroups.has(groupKey)}
            onToggle={() => onToggleGroup(groupKey)}
            disabled={disabled}
            changedPaths={changedPaths}
          />
        )
      })}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Eye, EyeOff, Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ConfigField } from "@/lib/graphql/types/config"

interface DynamicFieldProps {
  field: ConfigField
  value: string
  onChange: (path: string, value: string) => void
  disabled?: boolean
}

export function DynamicField({ field, value, onChange, disabled }: DynamicFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (newValue: string) => {
    onChange(field.path, newValue)
  }

  const inputClasses = "bg-background border-input focus-visible:ring-primary/30 focus-visible:border-primary"

  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.default || `Ingrese ${field.label?.toLowerCase()}`}
          disabled={disabled}
          className={cn(inputClasses, "min-h-[100px] resize-y")}
        />
      )

    case "password":
      return (
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="••••••••"
            disabled={disabled}
            className={cn(inputClasses, "pr-10 font-mono")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      )

    case "boolean":
      return (
        <div className="flex items-center gap-3 py-1">
          <Checkbox
            id={field.path}
            checked={value === "1" || value === "true" || value === "yes" || value === "on"}
            onCheckedChange={(checked) => handleChange(checked ? "1" : "0")}
            disabled={disabled}
            className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <label htmlFor={field.path} className="text-sm text-muted-foreground cursor-pointer select-none">
            {value === "1" || value === "true" ? "Activado" : "Desactivado"}
          </label>
        </div>
      )

    case "select":
      return (
        <Select value={value || ""} onValueChange={handleChange} disabled={disabled}>
          <SelectTrigger className={cn(inputClasses, "w-full")}>
            <SelectValue placeholder="Seleccione una opción" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case "integer":
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.default || "0"}
          disabled={disabled}
          className={cn(inputClasses, "font-mono")}
        />
      )

    case "image":
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="url"
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={disabled}
              className={cn(inputClasses, "flex-1")}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="flex-shrink-0 bg-transparent"
              disabled={disabled}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {value && (
            <div className="relative inline-block">
              <div className="p-2 bg-muted rounded-lg border border-border inline-block">
                <img
                  src={value || "/placeholder.svg"}
                  alt={field.label || "Preview"}
                  className="max-h-24 max-w-48 rounded object-contain"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = "none"
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleChange("")}
                className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )

    case "string":
    default:
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.default || `Ingrese ${field.label?.toLowerCase()}`}
          disabled={disabled}
          className={inputClasses}
        />
      )
  }
}

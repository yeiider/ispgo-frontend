"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tag, Plus, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Label {
  name: string
  color: string
}

interface LabelManagerProps {
  ticketId: string
  labels: Label[]
  onAddLabel: (name: string, color: string) => Promise<void>
  onRemoveLabel: (name: string) => Promise<void>
  disabled?: boolean
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#6b7280", // gray
]

const SUGGESTED_LABELS = [
  { name: "Bug", color: "#ef4444" },
  { name: "Urgente", color: "#f97316" },
  { name: "En espera", color: "#eab308" },
  { name: "Resuelto", color: "#22c55e" },
  { name: "Necesita info", color: "#3b82f6" },
  { name: "Seguimiento", color: "#8b5cf6" },
]

export function LabelManager({ ticketId, labels, onAddLabel, onRemoveLabel, disabled }: LabelManagerProps) {
  const [open, setOpen] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[5])
  const [adding, setAdding] = useState(false)
  const [removingLabel, setRemovingLabel] = useState<string | null>(null)

  const handleAddLabel = async () => {
    if (!newLabel.trim() || adding) return

    setAdding(true)
    try {
      await onAddLabel(newLabel.trim(), selectedColor)
      setNewLabel("")
    } catch (error) {
      console.error("Error adding label:", error)
    } finally {
      setAdding(false)
    }
  }

  const handleAddSuggested = async (label: Label) => {
    // Check if label already exists
    if (labels.some((l) => l.name.toLowerCase() === label.name.toLowerCase())) {
      return
    }

    setAdding(true)
    try {
      await onAddLabel(label.name, label.color)
    } catch (error) {
      console.error("Error adding label:", error)
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveLabel = async (name: string) => {
    setRemovingLabel(name)
    try {
      await onRemoveLabel(name)
    } catch (error) {
      console.error("Error removing label:", error)
    } finally {
      setRemovingLabel(null)
    }
  }

  // Filter out already added labels from suggestions
  const availableSuggestions = SUGGESTED_LABELS.filter(
    (s) => !labels.some((l) => l.name.toLowerCase() === s.name.toLowerCase()),
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className="gap-2 bg-transparent">
          <Tag className="h-4 w-4" />
          Etiquetas
          {labels.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">{labels.length}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b border-border">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Gestionar Etiquetas
          </h4>

          {/* Current Labels */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {labels.map((label) => (
                <Badge
                  key={label.name}
                  variant="outline"
                  className="text-xs pr-1 gap-1"
                  style={{
                    borderColor: label.color,
                    color: label.color,
                    backgroundColor: `${label.color}15`,
                  }}
                >
                  {label.name}
                  <button
                    onClick={() => handleRemoveLabel(label.name)}
                    disabled={removingLabel === label.name}
                    className="ml-1 hover:bg-black/10 rounded p-0.5"
                  >
                    {removingLabel === label.name ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add New Label */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Nueva etiqueta..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddLabel()
                  }
                }}
              />
              <Button size="sm" onClick={handleAddLabel} disabled={!newLabel.trim() || adding} className="h-8 px-2">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>

            {/* Color Picker */}
            <div className="flex gap-1.5 items-center">
              <span className="text-xs text-muted-foreground">Color:</span>
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-5 h-5 rounded-full transition-all",
                    selectedColor === color && "ring-2 ring-offset-2 ring-offset-background ring-primary",
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Suggested Labels */}
        {availableSuggestions.length > 0 && (
          <div className="p-3">
            <p className="text-xs text-muted-foreground mb-2">Sugerencias:</p>
            <div className="flex flex-wrap gap-1.5">
              {availableSuggestions.map((label) => (
                <Badge
                  key={label.name}
                  variant="outline"
                  className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    borderColor: label.color,
                    color: label.color,
                    backgroundColor: `${label.color}15`,
                  }}
                  onClick={() => handleAddSuggested(label)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {label.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

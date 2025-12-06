// Configuration system types based on Magento-like scope pattern

export interface ConfigOption {
  label: string
  value: string
}

export interface ConfigField {
  section?: string
  group?: string
  key: string
  label: string
  path: string
  type: "string" | "select" | "boolean" | "integer" | "textarea" | "password" | "image"
  required?: boolean
  default?: string | null
  options?: ConfigOption[] | null
  value?: string | null
}

export interface ConfigGroup {
  key: string
  label: string
  fields: ConfigField[]
}

export interface ConfigSection {
  key: string
  label: string
  groups: ConfigGroup[]
}

export interface ConfigItem {
  path: string
  value: string | null
  type?: string
  label?: string
}

export interface ConfigItemInput {
  path: string
  value: string | null
}

// Scope types - 0 is global, other IDs are router-specific
export interface ConfigScope {
  id: number
  name: string
  type: "global" | "router"
}

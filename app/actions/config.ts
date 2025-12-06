"use server"

import { graphqlClient } from "@/lib/graphql/client"
import type { ConfigSection, ConfigField, ConfigItem, ConfigItemInput } from "@/lib/graphql/types/config"
import { CONFIG_SCHEMA_QUERY, CONFIG_FIELDS_QUERY, UPSERT_CONFIG_MUTATION } from "@/lib/graphql/queries/config"

interface ConfigSchemaResponse {
  configSchema: ConfigSection[]
}

interface ConfigFieldsResponse {
  configFields: ConfigField[]
}

interface UpsertConfigResponse {
  upsertConfigValues: ConfigItem[]
}

export async function getConfigSchema() {
  try {
    console.log("[v0] Fetching config schema...")
    const data = await graphqlClient.request<ConfigSchemaResponse>(CONFIG_SCHEMA_QUERY)
    console.log("[v0] Config schema received:", data.configSchema?.length, "sections")
    return { success: true, data: data.configSchema }
  } catch (error) {
    console.error("[v0] Error fetching config schema:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getConfigFields(scopeId = 0) {
  try {
    console.log("[v0] Fetching config fields for scope:", scopeId)
    const data = await graphqlClient.request<ConfigFieldsResponse>(CONFIG_FIELDS_QUERY, {
      scope_id: scopeId,
    })
    console.log("[v0] Config fields received:", data.configFields?.length, "fields")
    return { success: true, data: data.configFields }
  } catch (error) {
    console.error("[v0] Error fetching config fields:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function saveConfigValues(items: ConfigItemInput[], scopeId = 0) {
  try {
    console.log("[v0] Saving config values for scope:", scopeId, "items:", items.length)
    const data = await graphqlClient.request<UpsertConfigResponse>(UPSERT_CONFIG_MUTATION, {
      scope_id: scopeId,
      items,
    })
    console.log("[v0] Config saved successfully")
    return { success: true, data: data.upsertConfigValues }
  } catch (error) {
    console.error("[v0] Error saving config values:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

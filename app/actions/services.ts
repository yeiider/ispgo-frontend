"use server"

import { graphqlRequest, type PaginatedResponse } from "@/lib/graphql/client"
import type { Service, CreateServiceInput, UpdateServiceInput, ServiceSearchFilters } from "@/lib/graphql/types"
import {
  SERVICES_QUERY,
  SERVICE_DETAIL_QUERY,
  CREATE_SERVICE_MUTATION,
  UPDATE_SERVICE_MUTATION,
} from "@/lib/graphql/queries/services"
import { revalidatePath } from "next/cache"

export async function getServices(page = 1, perPage = 10, filters?: ServiceSearchFilters) {
  try {
    // Build variables object with search parameters
    const variables: Record<string, unknown> = {
      first: perPage,
      page,
    }

    // Add search filters if provided - using "like" pattern for partial matching
    if (filters?.service_ip) {
      variables.service_ip = `%${filters.service_ip}%`
    }
    if (filters?.sn) {
      variables.sn = `%${filters.sn}%`
    }
    if (filters?.service_status && filters.service_status !== "all") {
      variables.service_status = filters.service_status
    }

    const data = await graphqlRequest<{ services: PaginatedResponse<Service> }>(SERVICES_QUERY, variables)
    return { success: true, data: data.services }
  } catch (error) {
    console.error("Error fetching services:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getService(id: string) {
  try {
    const data = await graphqlRequest<{ service: Service }>(SERVICE_DETAIL_QUERY, { id })
    return { success: true, data: data.service }
  } catch (error) {
    console.error("Error fetching service:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function createService(input: CreateServiceInput) {
  try {
    const data = await graphqlRequest<{ createService: Service }>(CREATE_SERVICE_MUTATION, input)
    revalidatePath("/services", "page")
    return { success: true, data: data.createService }
  } catch (error) {
    console.error("Error creating service:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updateService(input: UpdateServiceInput) {
  try {
    const data = await graphqlRequest<{ updateService: Service }>(UPDATE_SERVICE_MUTATION, input)
    revalidatePath("/services", "page")
    revalidatePath(`/services/${input.id}`, "page")
    return { success: true, data: data.updateService }
  } catch (error) {
    console.error("Error updating service:", error)
    return { success: false, error: (error as Error).message }
  }
}

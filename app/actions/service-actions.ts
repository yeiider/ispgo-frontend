"use server"

import { graphqlRequest } from "@/lib/graphql/client"
import { ACTIVATE_SERVICE_MUTATION, SUSPEND_SERVICE_MUTATION } from "@/lib/graphql/mutations"
import { revalidatePath } from "next/cache"

interface ActionResult {
  success: boolean
  message?: string
}

export async function activateService(serviceId: string): Promise<ActionResult> {
  try {
    const data = await graphqlRequest<{ activateService: ActionResult }>(ACTIVATE_SERVICE_MUTATION, {
      serviceId,
    })

    if (data.activateService.success) {
      revalidatePath(`/services/${serviceId}`)
      revalidatePath("/services")
    }

    return data.activateService
  } catch (error) {
    console.error("Error activating service:", error)
    return { success: false, message: (error as Error).message }
  }
}

export async function suspendService(serviceId: string): Promise<ActionResult> {
  try {
    const data = await graphqlRequest<{ suspendService: ActionResult }>(SUSPEND_SERVICE_MUTATION, {
      serviceId,
    })

    if (data.suspendService.success) {
      revalidatePath(`/services/${serviceId}`)
      revalidatePath("/services")
    }

    return data.suspendService
  } catch (error) {
    console.error("Error suspending service:", error)
    return { success: false, message: (error as Error).message }
  }
}

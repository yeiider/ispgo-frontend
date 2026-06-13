"use server"

import { graphqlRequest } from "@/lib/graphql/client"
import {
  SMARTOLT_REBOOT_ONU_MUTATION,
  SMARTOLT_ENABLE_ONU_MUTATION,
  SMARTOLT_DISABLE_ONU_MUTATION,
  SMARTOLT_REMOVE_EQUIPMENT_MUTATION,
  SMARTOLT_ENABLE_CATV_MUTATION,
  SMARTOLT_DISABLE_CATV_MUTATION,
} from "@/lib/graphql/mutations"
import { revalidatePath } from "next/cache"

interface ActionResult {
  success: boolean
  message?: string
}

export async function smartOltRebootOnu(serviceId: string, externalId: string): Promise<ActionResult> {
  try {
    const data = await graphqlRequest<{ smartOltRebootOnu: ActionResult }>(SMARTOLT_REBOOT_ONU_MUTATION, {
      externalId,
    })
    revalidatePath(`/services/${serviceId}`)
    return data.smartOltRebootOnu
  } catch (error) {
    console.error("Error rebooting ONU:", error)
    return { success: false, message: (error as Error).message }
  }
}

export async function smartOltEnableOnu(serviceId: string, sn: string): Promise<ActionResult> {
  try {
    const data = await graphqlRequest<{ smartOltEnableOnu: ActionResult }>(SMARTOLT_ENABLE_ONU_MUTATION, {
      sn,
    })
    revalidatePath(`/services/${serviceId}`)
    return data.smartOltEnableOnu
  } catch (error) {
    console.error("Error enabling ONU:", error)
    return { success: false, message: (error as Error).message }
  }
}

export async function smartOltDisableOnu(serviceId: string, sn: string): Promise<ActionResult> {
  try {
    const data = await graphqlRequest<{ smartOltDisableOnu: ActionResult }>(SMARTOLT_DISABLE_ONU_MUTATION, {
      sn,
    })
    revalidatePath(`/services/${serviceId}`)
    return data.smartOltDisableOnu
  } catch (error) {
    console.error("Error disabling ONU:", error)
    return { success: false, message: (error as Error).message }
  }
}

export async function smartOltRemoveEquipment(serviceId: string, sn: string): Promise<ActionResult> {
  try {
    const data = await graphqlRequest<{ smartOltRemoveEquipment: ActionResult }>(SMARTOLT_REMOVE_EQUIPMENT_MUTATION, {
      sn,
    })
    revalidatePath(`/services/${serviceId}`)
    return data.smartOltRemoveEquipment
  } catch (error) {
    console.error("Error removing equipment:", error)
    return { success: false, message: (error as Error).message }
  }
}

export async function smartOltEnableCatv(serviceId: string, externalId: string): Promise<ActionResult> {
  try {
    const data = await graphqlRequest<{ smartOltEnableCatv: ActionResult }>(SMARTOLT_ENABLE_CATV_MUTATION, {
      externalId,
    })
    revalidatePath(`/services/${serviceId}`)
    return data.smartOltEnableCatv
  } catch (error) {
    console.error("Error enabling CATV:", error)
    return { success: false, message: (error as Error).message }
  }
}

export async function smartOltDisableCatv(serviceId: string, externalId: string): Promise<ActionResult> {
  try {
    const data = await graphqlRequest<{ smartOltDisableCatv: ActionResult }>(SMARTOLT_DISABLE_CATV_MUTATION, {
      externalId,
    })
    revalidatePath(`/services/${serviceId}`)
    return data.smartOltDisableCatv
  } catch (error) {
    console.error("Error disabling CATV:", error)
    return { success: false, message: (error as Error).message }
  }
}

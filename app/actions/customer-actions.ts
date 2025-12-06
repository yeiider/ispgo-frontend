"use server"

import { graphqlRequest } from "@/lib/graphql/client"
import { GENERATE_INVOICE_MUTATION, UPDATE_CUSTOMER_STATUS_MUTATION } from "@/lib/graphql/mutations"
import { revalidatePath } from "next/cache"

interface ActionResult {
  success: boolean
  message?: string
}

interface GenerateInvoiceResult extends ActionResult {
  invoice?: {
    id: string
    increment_id: string
    total: number
    status: string
    issue_date: string
    due_date: string
  }
}

export async function generateInvoice(customerId: string, serviceId?: string): Promise<GenerateInvoiceResult> {
  try {
    const data = await graphqlRequest<{ generateInvoice: GenerateInvoiceResult }>(GENERATE_INVOICE_MUTATION, {
      customerId,
      serviceId,
    })

    if (data.generateInvoice.success) {
      revalidatePath(`/clients/${customerId}`)
      revalidatePath("/billing/invoices")
    }

    return data.generateInvoice
  } catch (error) {
    console.error("Error generating invoice:", error)
    return { success: false, message: (error as Error).message }
  }
}

export async function updateCustomerStatus(customerId: string, status: string): Promise<ActionResult> {
  try {
    const data = await graphqlRequest<{ updateCustomerStatus: ActionResult }>(UPDATE_CUSTOMER_STATUS_MUTATION, {
      customerId,
      status,
    })

    if (data.updateCustomerStatus.success) {
      revalidatePath(`/clients/${customerId}`)
      revalidatePath("/clients")
    }

    return data.updateCustomerStatus
  } catch (error) {
    console.error("Error updating customer status:", error)
    return { success: false, message: (error as Error).message }
  }
}

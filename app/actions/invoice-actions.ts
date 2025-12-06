"use server"

import { graphqlRequest } from "@/lib/graphql/client"
import {
  REGISTER_PAYMENT_MUTATION,
  APPLY_DISCOUNT_MUTATION,
  REGISTER_PAYMENT_PROMISE_MUTATION,
} from "@/lib/graphql/mutations"
import { revalidatePath } from "next/cache"

interface ActionResult {
  success: boolean
  message?: string
}

interface PaymentPromiseResult extends ActionResult {
  payment_promise?: {
    id: string
    amount: number
    promise_date: string
    notes?: string
    status: string
  }
}

export async function registerPayment(invoiceId: string, paymentMethod: string, notes?: string): Promise<ActionResult> {
  try {
    const data = await graphqlRequest<{ registerPayment: ActionResult }>(REGISTER_PAYMENT_MUTATION, {
      invoiceId,
      paymentMethod,
      notes,
    })

    if (data.registerPayment.success) {
      revalidatePath(`/billing/invoices/${invoiceId}`)
      revalidatePath("/billing/invoices")
    }

    return data.registerPayment
  } catch (error) {
    console.error("Error registering payment:", error)
    return { success: false, message: (error as Error).message }
  }
}

export async function applyDiscount(
  invoiceId: string,
  discount: number,
  isPercentage: boolean,
  includeTax: boolean,
): Promise<ActionResult> {
  try {
    const data = await graphqlRequest<{ applyDiscount: ActionResult }>(APPLY_DISCOUNT_MUTATION, {
      invoiceId,
      discount,
      isPercentage,
      includeTax,
    })

    if (data.applyDiscount.success) {
      revalidatePath(`/billing/invoices/${invoiceId}`)
      revalidatePath("/billing/invoices")
    }

    return data.applyDiscount
  } catch (error) {
    console.error("Error applying discount:", error)
    return { success: false, message: (error as Error).message }
  }
}

export async function registerPaymentPromise(
  invoiceId: string,
  promiseDate: string,
  notes?: string,
): Promise<PaymentPromiseResult> {
  try {
    const data = await graphqlRequest<{ registerPaymentPromise: PaymentPromiseResult }>(
      REGISTER_PAYMENT_PROMISE_MUTATION,
      {
        invoiceId,
        promiseDate,
        notes,
      },
    )

    if (data.registerPaymentPromise.success) {
      revalidatePath(`/billing/invoices/${invoiceId}`)
      revalidatePath("/billing/invoices")
    }

    return data.registerPaymentPromise
  } catch (error) {
    console.error("Error registering payment promise:", error)
    return { success: false, message: (error as Error).message }
  }
}

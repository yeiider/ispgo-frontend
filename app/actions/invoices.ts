"use server"

import { graphqlRequest, type PaginatedResponse } from "@/lib/graphql/client"
import type { Invoice } from "@/lib/graphql/types"
import { INVOICES_QUERY, INVOICE_DETAIL_QUERY } from "@/lib/graphql/queries/invoices"

export async function getInvoices(page = 1, perPage = 10) {
  try {
    const data = await graphqlRequest<{ invoices: PaginatedResponse<Invoice> }>(INVOICES_QUERY, {
      first: perPage,
      page,
    })
    return { success: true, data: data.invoices }
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getInvoice(id: string) {
  try {
    const data = await graphqlRequest<{ invoice: Invoice }>(INVOICE_DETAIL_QUERY, { id })
    return { success: true, data: data.invoice }
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return { success: false, error: (error as Error).message }
  }
}

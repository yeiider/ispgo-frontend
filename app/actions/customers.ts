"use server"

import { graphqlRequest, type PaginatedResponse } from "@/lib/graphql/client"
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  Address,
  CustomerSearchFilters,
} from "@/lib/graphql/types"
import {
  CUSTOMERS_QUERY,
  CUSTOMER_DETAIL_QUERY,
  CREATE_CUSTOMER_MUTATION,
  UPDATE_CUSTOMER_MUTATION,
  DELETE_CUSTOMER_MUTATION,
  CUSTOMER_ADDRESSES_QUERY,
} from "@/lib/graphql/queries/customers"
import { revalidatePath } from "next/cache"

export async function getCustomers(page = 1, perPage = 10, filters?: CustomerSearchFilters) {
  try {
    const variables: Record<string, unknown> = {
      first: perPage,
      page,
    }

    // Use global search parameter - searches across first_name, last_name, identity_document, email_address with OR
    if (filters?.search) {
      variables.search = filters.search // No % needed - API handles it
    }

    // Status filter can be combined with search
    if (filters?.customer_status && filters.customer_status !== "all") {
      variables.customer_status = filters.customer_status
    }

    const data = await graphqlRequest<{ customers: PaginatedResponse<Customer> }>(CUSTOMERS_QUERY, variables)
    return { success: true, data: data.customers }
  } catch (error) {
    console.error("Error fetching customers:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getCustomer(id: string) {
  try {
    const data = await graphqlRequest<{ customer: Customer }>(CUSTOMER_DETAIL_QUERY, { id })
    return { success: true, data: data.customer }
  } catch (error) {
    console.error("Error fetching customer:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function createCustomer(input: CreateCustomerInput) {
  try {
    const data = await graphqlRequest<{ createCustomer: Customer }>(CREATE_CUSTOMER_MUTATION, input)
    revalidatePath("/clients", "page")
    return { success: true, data: data.createCustomer }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updateCustomer(input: UpdateCustomerInput) {
  try {
    const data = await graphqlRequest<{ updateCustomer: Customer }>(UPDATE_CUSTOMER_MUTATION, input)
    revalidatePath("/clients", "page")
    revalidatePath(`/clients/${input.id}`, "page")
    return { success: true, data: data.updateCustomer }
  } catch (error) {
    console.error("Error updating customer:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function deleteCustomer(id: string) {
  try {
    const data = await graphqlRequest<{ deleteCustomer: Customer }>(DELETE_CUSTOMER_MUTATION, { id })
    revalidatePath("/clients", "page")
    return { success: true, data: data.deleteCustomer }
  } catch (error) {
    console.error("Error deleting customer:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getCustomerAddresses(id: string) {
  try {
    const data = await graphqlRequest<{
      customer: { id: string; first_name: string; last_name: string; addresses: Address[] }
    }>(CUSTOMER_ADDRESSES_QUERY, { id })
    return { success: true, data: data.customer }
  } catch (error) {
    console.error("Error fetching customer addresses:", error)
    return { success: false, error: (error as Error).message }
  }
}

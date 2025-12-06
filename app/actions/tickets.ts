"use server"

import { graphqlRequest, type PaginatedResponse } from "@/lib/graphql/client"
import type { Ticket, TicketSearchFilters, CreateTicketInput, UpdateTicketInput } from "@/lib/graphql/types"
import {
  TICKETS_QUERY,
  TICKET_QUERY,
  CREATE_TICKET_MUTATION,
  UPDATE_TICKET_MUTATION,
  DELETE_TICKET_MUTATION,
  ADD_TICKET_COMMENT_MUTATION,
  ADD_TICKET_LABEL_MUTATION,
  REMOVE_TICKET_LABEL_MUTATION,
  ASSIGN_USERS_TO_TICKET_MUTATION,
} from "@/lib/graphql/queries/tickets"

interface TicketsResponse {
  tickets: PaginatedResponse<Ticket>
}

interface TicketResponse {
  ticket: Ticket
}

export async function getTickets(
  page = 1,
  perPage = 50,
  filters?: TicketSearchFilters,
): Promise<PaginatedResponse<Ticket>> {
  const variables: Record<string, unknown> = {
    first: perPage,
    page,
  }

  if (filters?.status) {
    variables.status = filters.status
  }
  if (filters?.priority) {
    variables.priority = filters.priority
  }
  if (filters?.customer_id) {
    variables.customerId = filters.customer_id
  }
  if (filters?.service_id) {
    variables.serviceId = filters.service_id
  }
  if (filters?.title) {
    variables.title = `%${filters.title}%`
  }

  const response = await graphqlRequest<TicketsResponse>(TICKETS_QUERY, variables)
  return response.tickets
}

export async function getTicket(id: string): Promise<Ticket> {
  const response = await graphqlRequest<TicketResponse>(TICKET_QUERY, { id })
  return response.ticket
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const response = await graphqlRequest<{ createTicket: Ticket }>(CREATE_TICKET_MUTATION, {
    customer_id: input.customer_id || null,
    service_id: input.service_id || null,
    issue_type: input.issue_type,
    priority: input.priority,
    status: input.status || "open",
    title: input.title,
    description: input.description,
    contact_method: input.contact_method || null,
    user_ids: input.user_ids || [],
  })
  return response.createTicket
}

export async function updateTicket(input: UpdateTicketInput): Promise<Ticket> {
  const response = await graphqlRequest<{ updateTicket: Ticket }>(UPDATE_TICKET_MUTATION, {
    id: input.id,
    customer_id: input.customer_id,
    service_id: input.service_id,
    issue_type: input.issue_type,
    priority: input.priority,
    status: input.status,
    title: input.title,
    description: input.description,
    contact_method: input.contact_method,
    resolution_notes: input.resolution_notes,
  })
  return response.updateTicket
}

export async function deleteTicket(id: string): Promise<{ success: boolean; message: string }> {
  const response = await graphqlRequest<{ deleteTicket: { success: boolean; message: string } }>(
    DELETE_TICKET_MUTATION,
    { id },
  )
  return response.deleteTicket
}

export async function addTicketComment(ticketId: string, comment: string, isInternal = false): Promise<unknown> {
  const response = await graphqlRequest<{ addTicketComment: unknown }>(ADD_TICKET_COMMENT_MUTATION, {
    ticketId,
    comment,
    isInternal,
  })
  return response.addTicketComment
}

export async function addTicketLabel(ticketId: string, name: string, color = "#3498db"): Promise<unknown> {
  const response = await graphqlRequest<{ addTicketLabel: unknown }>(ADD_TICKET_LABEL_MUTATION, {
    ticketId,
    name,
    color,
  })
  return response.addTicketLabel
}

export async function removeTicketLabel(ticketId: string, name: string): Promise<unknown> {
  const response = await graphqlRequest<{ removeTicketLabel: unknown }>(REMOVE_TICKET_LABEL_MUTATION, {
    ticketId,
    name,
  })
  return response.removeTicketLabel
}

export async function assignUsersToTicket(ticketId: string, userIds: string[]): Promise<unknown> {
  const response = await graphqlRequest<{ assignUsersToTicket: unknown }>(ASSIGN_USERS_TO_TICKET_MUTATION, {
    ticketId,
    userIds,
  })
  return response.assignUsersToTicket
}

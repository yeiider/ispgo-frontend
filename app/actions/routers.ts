"use server"

import { graphqlClient } from "@/lib/graphql/client"
import type { Router, CreateRouterInput, UpdateRouterInput } from "@/lib/graphql/types"
import {
  ROUTERS_QUERY,
  ROUTER_DETAIL_QUERY,
  ALL_ROUTERS_QUERY,
  CREATE_ROUTER_MUTATION,
  UPDATE_ROUTER_MUTATION,
  DELETE_ROUTER_MUTATION,
} from "@/lib/graphql/queries/routers"

interface PaginatorInfo {
  count: number
  total: number
}

interface RoutersResponse {
  routers: {
    data: Router[]
    paginatorInfo: PaginatorInfo
  }
}

interface RouterResponse {
  router: Router
}

interface AllRoutersResponse {
  routers: {
    data: Router[]
  }
}

interface CreateRouterResponse {
  createRouter: Router
}

interface UpdateRouterResponse {
  updateRouter: Router
}

interface DeleteRouterResponse {
  deleteRouter: Router
}

export async function getRouters(page = 1, perPage = 10) {
  try {
    const data = await graphqlClient.request<RoutersResponse>(ROUTERS_QUERY, {
      first: perPage,
      page,
    })
    return { success: true, data: data.routers.data, paginatorInfo: data.routers.paginatorInfo }
  } catch (error) {
    console.error("Error fetching routers:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getRouter(id: string) {
  try {
    const data = await graphqlClient.request<RouterResponse>(ROUTER_DETAIL_QUERY, { id })
    return { success: true, data: data.router }
  } catch (error) {
    console.error("Error fetching router:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getAllRouters() {
  try {
    const data = await graphqlClient.request<AllRoutersResponse>(ALL_ROUTERS_QUERY)
    return { success: true, data: data.routers.data }
  } catch (error) {
    console.error("Error fetching all routers:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function createRouter(input: CreateRouterInput) {
  try {
    const data = await graphqlClient.request<CreateRouterResponse>(CREATE_ROUTER_MUTATION, input)
    return { success: true, data: data.createRouter }
  } catch (error) {
    console.error("Error creating router:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateRouter(input: UpdateRouterInput) {
  try {
    const data = await graphqlClient.request<UpdateRouterResponse>(UPDATE_ROUTER_MUTATION, input)
    return { success: true, data: data.updateRouter }
  } catch (error) {
    console.error("Error updating router:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function deleteRouter(id: string) {
  try {
    const data = await graphqlClient.request<DeleteRouterResponse>(DELETE_ROUTER_MUTATION, { id })
    return { success: true, data: data.deleteRouter }
  } catch (error) {
    console.error("Error deleting router:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

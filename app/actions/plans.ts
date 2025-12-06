"use server"

import { graphqlClient } from "@/lib/graphql/client"
import type { Plan, CreatePlanInput, UpdatePlanInput } from "@/lib/graphql/types"
import {
  PLANS_QUERY,
  PLAN_DETAIL_QUERY,
  ALL_PLANS_QUERY,
  CREATE_PLAN_MUTATION,
  UPDATE_PLAN_MUTATION,
  DELETE_PLAN_MUTATION,
} from "@/lib/graphql/queries/plans"

interface PaginatorInfo {
  count: number
  total: number
}

interface PlansResponse {
  plans: {
    data: Plan[]
    paginatorInfo: PaginatorInfo
  }
}

interface PlanResponse {
  plan: Plan
}

interface AllPlansResponse {
  plans: {
    data: Plan[]
  }
}

interface CreatePlanResponse {
  createPlan: Plan
}

interface UpdatePlanResponse {
  updatePlan: Plan
}

interface DeletePlanResponse {
  deletePlan: Plan
}

export async function getPlans(page = 1, perPage = 10) {
  try {
    const data = await graphqlClient.request<PlansResponse>(PLANS_QUERY, {
      first: perPage,
      page,
    })
    return { success: true, data: data.plans.data, paginatorInfo: data.plans.paginatorInfo }
  } catch (error) {
    console.error("Error fetching plans:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getPlan(id: string) {
  try {
    const data = await graphqlClient.request<PlanResponse>(PLAN_DETAIL_QUERY, { id })
    return { success: true, data: data.plan }
  } catch (error) {
    console.error("Error fetching plan:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getAllPlans() {
  try {
    const data = await graphqlClient.request<AllPlansResponse>(ALL_PLANS_QUERY)
    return { success: true, data: data.plans.data }
  } catch (error) {
    console.error("Error fetching all plans:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function createPlan(input: CreatePlanInput) {
  try {
    const data = await graphqlClient.request<CreatePlanResponse>(CREATE_PLAN_MUTATION, {
      name: input.name,
      monthly_price: input.monthly_price,
      download_speed: input.download_speed,
      upload_speed: input.upload_speed,
      status: input.status || "active",
    })
    return { success: true, data: data.createPlan }
  } catch (error) {
    console.error("Error creating plan:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updatePlan(input: UpdatePlanInput) {
  try {
    const data = await graphqlClient.request<UpdatePlanResponse>(UPDATE_PLAN_MUTATION, input)
    return { success: true, data: data.updatePlan }
  } catch (error) {
    console.error("Error updating plan:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function deletePlan(id: string) {
  try {
    const data = await graphqlClient.request<DeletePlanResponse>(DELETE_PLAN_MUTATION, { id })
    return { success: true, data: data.deletePlan }
  } catch (error) {
    console.error("Error deleting plan:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

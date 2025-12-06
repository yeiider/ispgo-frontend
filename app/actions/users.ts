"use server"

import { graphqlRequest, type PaginatedResponse } from "@/lib/graphql/client"
import type {
  SystemUser,
  Role,
  Permission,
  CreateUserInput,
  UpdateUserInput,
  CreateRoleInput,
  UpdateRoleInput,
  CreatePermissionInput,
  UpdatePermissionInput,
  DeleteResponse,
  UserSearchFilters,
} from "@/lib/graphql/types"
import {
  USERS_QUERY,
  USERS_SIMPLE_QUERY,
  USER_DETAIL_QUERY,
  CREATE_USER_MUTATION,
  UPDATE_USER_MUTATION,
  DELETE_USER_MUTATION,
  ROLES_QUERY,
  ROLE_DETAIL_QUERY,
  CREATE_ROLE_MUTATION,
  UPDATE_ROLE_MUTATION,
  DELETE_ROLE_MUTATION,
  PERMISSIONS_QUERY,
  CREATE_PERMISSION_MUTATION,
  UPDATE_PERMISSION_MUTATION,
  DELETE_PERMISSION_MUTATION,
  SYNC_ROLES_TO_USER_MUTATION,
  SYNC_PERMISSIONS_TO_ROLE_MUTATION,
  SYNC_PERMISSIONS_TO_USER_MUTATION,
  ASSIGN_ROLE_TO_USER_MUTATION,
  REMOVE_ROLE_FROM_USER_MUTATION,
  ASSIGN_PERMISSION_TO_ROLE_MUTATION,
  REMOVE_PERMISSION_FROM_ROLE_MUTATION,
  ASSIGN_PERMISSION_TO_USER_MUTATION,
  REMOVE_PERMISSION_FROM_USER_MUTATION,
} from "@/lib/graphql/queries/users"
import { revalidatePath } from "next/cache"

// ==================== USERS ====================

export async function getUsers(page = 1, perPage = 10, filters?: UserSearchFilters) {
  try {
    const variables: Record<string, unknown> = {
      first: perPage,
      page,
    }

    if (filters?.search) {
      variables.name = `%${filters.search}%`
    }

    const data = await graphqlRequest<{ users: PaginatedResponse<SystemUser> }>(USERS_QUERY, variables)
    return { success: true, data: data.users }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getUsersSimple(page = 1, perPage = 50, search?: string) {
  try {
    const variables: Record<string, unknown> = {
      first: perPage,
      page,
    }

    if (search) {
      variables.name = `%${search}%`
    }

    const data = await graphqlRequest<{
      users: PaginatedResponse<Pick<SystemUser, "id" | "name" | "email" | "telephone">>
    }>(USERS_SIMPLE_QUERY, variables)
    return { success: true, data: data.users }
  } catch (error) {
    console.error("Error fetching users (simple):", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getUser(id: string) {
  try {
    const data = await graphqlRequest<{ user: SystemUser }>(USER_DETAIL_QUERY, { id })
    return { success: true, data: data.user }
  } catch (error) {
    console.error("Error fetching user:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function createUser(input: CreateUserInput) {
  try {
    const data = await graphqlRequest<{ createUser: SystemUser }>(CREATE_USER_MUTATION, input)
    revalidatePath("/users", "page")
    return { success: true, data: data.createUser }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updateUser(input: UpdateUserInput) {
  try {
    const data = await graphqlRequest<{ updateUser: SystemUser }>(UPDATE_USER_MUTATION, input)
    revalidatePath("/users", "page")
    revalidatePath(`/users/${input.id}`, "page")
    return { success: true, data: data.updateUser }
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function deleteUser(id: string) {
  try {
    const data = await graphqlRequest<{ deleteUser: DeleteResponse }>(DELETE_USER_MUTATION, { id })
    revalidatePath("/users", "page")
    return { success: true, data: data.deleteUser }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: (error as Error).message }
  }
}

// ==================== ROLES ====================

export async function getRoles() {
  try {
    const data = await graphqlRequest<{ roles: Role[] }>(ROLES_QUERY)
    return { success: true, data: data.roles }
  } catch (error) {
    console.error("Error fetching roles:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getRole(id: string) {
  try {
    const data = await graphqlRequest<{ role: Role }>(ROLE_DETAIL_QUERY, { id })
    return { success: true, data: data.role }
  } catch (error) {
    console.error("Error fetching role:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function createRole(input: CreateRoleInput) {
  try {
    const data = await graphqlRequest<{ createRole: Role }>(CREATE_ROLE_MUTATION, {
      ...input,
      guard_name: input.guard_name || "web",
    })
    revalidatePath("/users/roles", "page")
    return { success: true, data: data.createRole }
  } catch (error) {
    console.error("Error creating role:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updateRole(input: UpdateRoleInput) {
  try {
    const data = await graphqlRequest<{ updateRole: Role }>(UPDATE_ROLE_MUTATION, input)
    revalidatePath("/users/roles", "page")
    return { success: true, data: data.updateRole }
  } catch (error) {
    console.error("Error updating role:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function deleteRole(id: string) {
  try {
    const data = await graphqlRequest<{ deleteRole: DeleteResponse }>(DELETE_ROLE_MUTATION, { id })
    revalidatePath("/users/roles", "page")
    return { success: true, data: data.deleteRole }
  } catch (error) {
    console.error("Error deleting role:", error)
    return { success: false, error: (error as Error).message }
  }
}

// ==================== PERMISSIONS ====================

export async function getPermissions() {
  try {
    const data = await graphqlRequest<{ permissions: Permission[] }>(PERMISSIONS_QUERY)
    return { success: true, data: data.permissions }
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function createPermission(input: CreatePermissionInput) {
  try {
    const data = await graphqlRequest<{ createPermission: Permission }>(CREATE_PERMISSION_MUTATION, {
      ...input,
      guard_name: input.guard_name || "web",
    })
    revalidatePath("/users/roles", "page")
    return { success: true, data: data.createPermission }
  } catch (error) {
    console.error("Error creating permission:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updatePermission(input: UpdatePermissionInput) {
  try {
    const data = await graphqlRequest<{ updatePermission: Permission }>(UPDATE_PERMISSION_MUTATION, input)
    revalidatePath("/users/roles", "page")
    return { success: true, data: data.updatePermission }
  } catch (error) {
    console.error("Error updating permission:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function deletePermission(id: string) {
  try {
    const data = await graphqlRequest<{ deletePermission: DeleteResponse }>(DELETE_PERMISSION_MUTATION, { id })
    revalidatePath("/users/roles", "page")
    return { success: true, data: data.deletePermission }
  } catch (error) {
    console.error("Error deleting permission:", error)
    return { success: false, error: (error as Error).message }
  }
}

// ==================== ROLE ASSIGNMENTS ====================

export async function assignRoleToUser(userId: string, roleId: string) {
  try {
    const data = await graphqlRequest<{ assignRoleToUser: SystemUser }>(ASSIGN_ROLE_TO_USER_MUTATION, {
      user_id: userId,
      role_id: roleId,
    })
    revalidatePath("/users", "page")
    return { success: true, data: data.assignRoleToUser }
  } catch (error) {
    console.error("Error assigning role to user:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  try {
    const data = await graphqlRequest<{ removeRoleFromUser: SystemUser }>(REMOVE_ROLE_FROM_USER_MUTATION, {
      user_id: userId,
      role_id: roleId,
    })
    revalidatePath("/users", "page")
    return { success: true, data: data.removeRoleFromUser }
  } catch (error) {
    console.error("Error removing role from user:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function syncRolesToUser(userId: string, roleIds: string[]) {
  try {
    const data = await graphqlRequest<{ syncRolesToUser: SystemUser }>(SYNC_ROLES_TO_USER_MUTATION, {
      user_id: userId,
      role_ids: roleIds,
    })
    revalidatePath("/users", "page")
    return { success: true, data: data.syncRolesToUser }
  } catch (error) {
    console.error("Error syncing roles to user:", error)
    return { success: false, error: (error as Error).message }
  }
}

// ==================== PERMISSION ASSIGNMENTS TO ROLES ====================

export async function assignPermissionToRole(roleId: string, permissionId: string) {
  try {
    const data = await graphqlRequest<{ assignPermissionToRole: Role }>(ASSIGN_PERMISSION_TO_ROLE_MUTATION, {
      role_id: roleId,
      permission_id: permissionId,
    })
    revalidatePath("/users/roles", "page")
    return { success: true, data: data.assignPermissionToRole }
  } catch (error) {
    console.error("Error assigning permission to role:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function removePermissionFromRole(roleId: string, permissionId: string) {
  try {
    const data = await graphqlRequest<{ removePermissionFromRole: Role }>(REMOVE_PERMISSION_FROM_ROLE_MUTATION, {
      role_id: roleId,
      permission_id: permissionId,
    })
    revalidatePath("/users/roles", "page")
    return { success: true, data: data.removePermissionFromRole }
  } catch (error) {
    console.error("Error removing permission from role:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function syncPermissionsToRole(roleId: string, permissionIds: string[]) {
  try {
    const data = await graphqlRequest<{ syncPermissionsToRole: Role }>(SYNC_PERMISSIONS_TO_ROLE_MUTATION, {
      role_id: roleId,
      permission_ids: permissionIds,
    })
    revalidatePath("/users/roles", "page")
    return { success: true, data: data.syncPermissionsToRole }
  } catch (error) {
    console.error("Error syncing permissions to role:", error)
    return { success: false, error: (error as Error).message }
  }
}

// ==================== DIRECT PERMISSION ASSIGNMENTS TO USERS ====================

export async function assignPermissionToUser(userId: string, permissionId: string) {
  try {
    const data = await graphqlRequest<{ assignPermissionToUser: SystemUser }>(ASSIGN_PERMISSION_TO_USER_MUTATION, {
      user_id: userId,
      permission_id: permissionId,
    })
    revalidatePath("/users", "page")
    return { success: true, data: data.assignPermissionToUser }
  } catch (error) {
    console.error("Error assigning permission to user:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function removePermissionFromUser(userId: string, permissionId: string) {
  try {
    const data = await graphqlRequest<{ removePermissionFromUser: SystemUser }>(REMOVE_PERMISSION_FROM_USER_MUTATION, {
      user_id: userId,
      permission_id: permissionId,
    })
    revalidatePath("/users", "page")
    return { success: true, data: data.removePermissionFromUser }
  } catch (error) {
    console.error("Error removing permission from user:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function syncPermissionsToUser(userId: string, permissionIds: string[]) {
  try {
    const data = await graphqlRequest<{ syncPermissionsToUser: SystemUser }>(SYNC_PERMISSIONS_TO_USER_MUTATION, {
      user_id: userId,
      permission_ids: permissionIds,
    })
    revalidatePath("/users", "page")
    return { success: true, data: data.syncPermissionsToUser }
  } catch (error) {
    console.error("Error syncing permissions to user:", error)
    return { success: false, error: (error as Error).message }
  }
}

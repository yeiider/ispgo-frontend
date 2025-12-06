// Users, Roles, and Permissions GraphQL Queries and Mutations

// ==================== USERS ====================

export const USERS_SIMPLE_QUERY = `
  query GetUsersSimple($first: Int!, $page: Int, $name: String) {
    users(first: $first, page: $page, name: $name) {
      data {
        id
        name
        email
        telephone
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        total
        lastPage
        perPage
      }
    }
  }
`

export const USERS_QUERY = `
  query GetUsers($first: Int!, $page: Int, $name: String) {
    users(first: $first, page: $page, name: $name) {
      data {
        id
        name
        email
        telephone
        router_id
        created_at
        updated_at
        roles {
          id
          name
        }
        permissions {
          id
          name
        }
        allPermissions {
          id
          name
        }
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        total
        lastPage
        perPage
      }
    }
  }
`

export const USER_DETAIL_QUERY = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      telephone
      router_id
      created_at
      updated_at
      roles {
        id
        name
        permissions {
          id
          name
        }
      }
      permissions {
        id
        name
      }
      allPermissions {
        id
        name
      }
    }
  }
`

export const CREATE_USER_MUTATION = `
  mutation CreateUser(
    $name: String!
    $email: String!
    $password: String!
    $telephone: String
    $router_id: Int
  ) {
    createUser(
      name: $name
      email: $email
      password: $password
      telephone: $telephone
      router_id: $router_id
    ) {
      id
      name
      email
      telephone
      created_at
    }
  }
`

export const UPDATE_USER_MUTATION = `
  mutation UpdateUser(
    $id: ID!
    $name: String
    $email: String
    $telephone: String
  ) {
    updateUser(
      id: $id
      name: $name
      email: $email
      telephone: $telephone
    ) {
      id
      name
      email
      telephone
      updated_at
    }
  }
`

export const DELETE_USER_MUTATION = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`

// ==================== ROLES ====================

export const ROLES_QUERY = `
  query GetRoles {
    roles {
      id
      name
      guard_name
      created_at
      permissions {
        id
        name
      }
      users {
        id
        name
        email
      }
    }
  }
`

export const ROLE_DETAIL_QUERY = `
  query GetRole($id: ID!) {
    role(id: $id) {
      id
      name
      guard_name
      created_at
      permissions {
        id
        name
      }
      users {
        id
        name
        email
      }
    }
  }
`

export const CREATE_ROLE_MUTATION = `
  mutation CreateRole($name: String!, $guard_name: String) {
    createRole(name: $name, guard_name: $guard_name) {
      id
      name
      guard_name
      created_at
    }
  }
`

export const UPDATE_ROLE_MUTATION = `
  mutation UpdateRole($id: ID!, $name: String!) {
    updateRole(id: $id, name: $name) {
      id
      name
      updated_at
    }
  }
`

export const DELETE_ROLE_MUTATION = `
  mutation DeleteRole($id: ID!) {
    deleteRole(id: $id) {
      success
      message
    }
  }
`

// ==================== PERMISSIONS ====================

export const PERMISSIONS_QUERY = `
  query GetPermissions {
    permissions {
      id
      name
      guard_name
      created_at
      roles {
        id
        name
      }
    }
  }
`

export const PERMISSION_DETAIL_QUERY = `
  query GetPermission($id: ID!) {
    permission(id: $id) {
      id
      name
      guard_name
      created_at
      roles {
        id
        name
      }
      users {
        id
        name
      }
    }
  }
`

export const CREATE_PERMISSION_MUTATION = `
  mutation CreatePermission($name: String!, $guard_name: String) {
    createPermission(name: $name, guard_name: $guard_name) {
      id
      name
      guard_name
      created_at
    }
  }
`

export const UPDATE_PERMISSION_MUTATION = `
  mutation UpdatePermission($id: ID!, $name: String!) {
    updatePermission(id: $id, name: $name) {
      id
      name
      updated_at
    }
  }
`

export const DELETE_PERMISSION_MUTATION = `
  mutation DeletePermission($id: ID!) {
    deletePermission(id: $id) {
      success
      message
    }
  }
`

// ==================== ROLE ASSIGNMENTS ====================

export const ASSIGN_ROLE_TO_USER_MUTATION = `
  mutation AssignRoleToUser($user_id: ID!, $role_id: ID!) {
    assignRoleToUser(user_id: $user_id, role_id: $role_id) {
      id
      name
      roles {
        id
        name
      }
    }
  }
`

export const REMOVE_ROLE_FROM_USER_MUTATION = `
  mutation RemoveRoleFromUser($user_id: ID!, $role_id: ID!) {
    removeRoleFromUser(user_id: $user_id, role_id: $role_id) {
      id
      name
      roles {
        id
        name
      }
    }
  }
`

export const SYNC_ROLES_TO_USER_MUTATION = `
  mutation SyncRolesToUser($user_id: ID!, $role_ids: [ID!]!) {
    syncRolesToUser(user_id: $user_id, role_ids: $role_ids) {
      id
      name
      roles {
        id
        name
      }
    }
  }
`

// ==================== PERMISSION ASSIGNMENTS TO ROLES ====================

export const ASSIGN_PERMISSION_TO_ROLE_MUTATION = `
  mutation AssignPermissionToRole($role_id: ID!, $permission_id: ID!) {
    assignPermissionToRole(role_id: $role_id, permission_id: $permission_id) {
      id
      name
      permissions {
        id
        name
      }
    }
  }
`

export const REMOVE_PERMISSION_FROM_ROLE_MUTATION = `
  mutation RemovePermissionFromRole($role_id: ID!, $permission_id: ID!) {
    removePermissionFromRole(role_id: $role_id, permission_id: $permission_id) {
      id
      name
      permissions {
        id
        name
      }
    }
  }
`

export const SYNC_PERMISSIONS_TO_ROLE_MUTATION = `
  mutation SyncPermissionsToRole($role_id: ID!, $permission_ids: [ID!]!) {
    syncPermissionsToRole(role_id: $role_id, permission_ids: $permission_ids) {
      id
      name
      permissions {
        id
        name
      }
    }
  }
`

// ==================== DIRECT PERMISSION ASSIGNMENTS TO USERS ====================

export const ASSIGN_PERMISSION_TO_USER_MUTATION = `
  mutation AssignPermissionToUser($user_id: ID!, $permission_id: ID!) {
    assignPermissionToUser(user_id: $user_id, permission_id: $permission_id) {
      id
      name
      permissions {
        id
        name
      }
      allPermissions {
        id
        name
      }
    }
  }
`

export const REMOVE_PERMISSION_FROM_USER_MUTATION = `
  mutation RemovePermissionFromUser($user_id: ID!, $permission_id: ID!) {
    removePermissionFromUser(user_id: $user_id, permission_id: $permission_id) {
      id
      name
      permissions {
        id
        name
      }
    }
  }
`

export const SYNC_PERMISSIONS_TO_USER_MUTATION = `
  mutation SyncPermissionsToUser($user_id: ID!, $permission_ids: [ID!]!) {
    syncPermissionsToUser(user_id: $user_id, permission_ids: $permission_ids) {
      id
      name
      permissions {
        id
        name
      }
      allPermissions {
        id
        name
      }
    }
  }
`

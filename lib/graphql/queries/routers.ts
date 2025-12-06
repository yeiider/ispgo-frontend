export const ROUTERS_QUERY = `
  query GetRouters($first: Int!, $page: Int) {
    routers(first: $first, page: $page) {
      data {
        id
        name
      }
      paginatorInfo {
        count
        total
      }
    }
  }
`

export const ROUTER_DETAIL_QUERY = `
  query GetRouter($id: ID!) {
    router(id: $id) {
      id
      name
    }
  }
`

export const ALL_ROUTERS_QUERY = `
  query GetAllRouters {
    routers(first: 100) {
      data {
        id
        name
      }
    }
  }
`

export const CREATE_ROUTER_MUTATION = `
  mutation CreateRouter($name: String!) {
    createRouter(name: $name) {
      id
      name
    }
  }
`

export const UPDATE_ROUTER_MUTATION = `
  mutation UpdateRouter($id: ID!, $name: String) {
    updateRouter(id: $id, name: $name) {
      id
      name
    }
  }
`

export const DELETE_ROUTER_MUTATION = `
  mutation DeleteRouter($id: ID!) {
    deleteRouter(id: $id) {
      id
      name
    }
  }
`

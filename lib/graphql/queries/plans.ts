export const PLANS_QUERY = `
  query GetPlans($first: Int!, $page: Int) {
    plans(first: $first, page: $page) {
      data {
        id
        name
        monthly_price
        download_speed
        upload_speed
        status
      }
      paginatorInfo {
        count
        total
      }
    }
  }
`

export const PLAN_DETAIL_QUERY = `
  query GetPlan($id: ID!) {
    plan(id: $id) {
      id
      name
      monthly_price
      download_speed
      upload_speed
      status
    }
  }
`

export const ALL_PLANS_QUERY = `
  query GetAllPlans {
    plans(first: 100) {
      data {
        id
        name
        monthly_price
        download_speed
        upload_speed
        status
      }
    }
  }
`

export const CREATE_PLAN_MUTATION = `
  mutation CreatePlan($name: String!, $monthly_price: Float!, $download_speed: Int!, $upload_speed: Int!, $status: String!) {
    createPlan(name: $name, monthly_price: $monthly_price, download_speed: $download_speed, upload_speed: $upload_speed, status: $status) {
      id
      name
      monthly_price
      download_speed
      upload_speed
      status
    }
  }
`

export const UPDATE_PLAN_MUTATION = `
  mutation UpdatePlan($id: ID!, $name: String, $monthly_price: Float, $download_speed: Int, $upload_speed: Int, $status: String) {
    updatePlan(id: $id, name: $name, monthly_price: $monthly_price, download_speed: $download_speed, upload_speed: $upload_speed, status: $status) {
      id
      name
      monthly_price
      download_speed
      upload_speed
      status
    }
  }
`

export const DELETE_PLAN_MUTATION = `
  mutation DeletePlan($id: ID!) {
    deletePlan(id: $id) {
      id
      name
    }
  }
`

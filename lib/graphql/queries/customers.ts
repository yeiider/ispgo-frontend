export const CUSTOMERS_QUERY = `
  query GetCustomers(
    $first: Int!, 
    $page: Int,
    $search: String,
    $customer_status: String
  ) {
    customers(
      first: $first, 
      page: $page,
      search: $search,
      customer_status: $customer_status
    ) {
      data {
        id
        first_name
        last_name
        email_address
        phone_number
        identity_document
        document_type
        customer_status
        created_at
        updated_at
        router {
          id
          name
        }
        services {
          id
          service_status
          plan {
            name
            monthly_price
          }
        }
      }
      paginatorInfo {
        currentPage
        lastPage
        perPage
        total
        hasMorePages
      }
    }
  }
`

export const CUSTOMER_DETAIL_QUERY = `
  query GetCustomer($id: ID!) {
    customer(id: $id) {
      id
      first_name
      last_name
      email_address
      phone_number
      identity_document
      document_type
      customer_status
      created_at
      updated_at
      router {
        id
        name
      }
      addresses {
        id
        address
        city
        state_province
        postal_code
        country
        address_type
      }
      services {
        id
        service_ip
        service_status
        activation_date
        router {
          id
          name
        }
        plan {
          id
          name
          monthly_price
        }
      }
      invoices {
        id
        increment_id
        total
        status
        issue_date
        due_date
      }
    }
  }
`

export const CUSTOMER_ADDRESSES_QUERY = `
  query GetCustomerAddresses($id: ID!) {
    customer(id: $id) {
      id
      first_name
      last_name
      addresses {
        id
        address
        city
        state_province
        postal_code
        country
        address_type
      }
    }
  }
`

export const CREATE_CUSTOMER_MUTATION = `
  mutation CreateCustomer(
    $first_name: String!
    $last_name: String!
    $email_address: String
    $phone_number: String
    $identity_document: String!
    $document_type: String!
    $router_id: Int
  ) {
    createCustomer(
      first_name: $first_name
      last_name: $last_name
      email_address: $email_address
      phone_number: $phone_number
      identity_document: $identity_document
      document_type: $document_type
      router_id: $router_id
    ) {
      id
      first_name
      last_name
      document_type
      router {
        id
        name
      }
      created_at
    }
  }
`

export const UPDATE_CUSTOMER_MUTATION = `
  mutation UpdateCustomer(
    $id: ID!
    $first_name: String
    $last_name: String
    $email_address: String
    $phone_number: String
    $document_type: String
    $router_id: Int
  ) {
    updateCustomer(
      id: $id
      first_name: $first_name
      last_name: $last_name
      email_address: $email_address
      phone_number: $phone_number
      document_type: $document_type
      router_id: $router_id
    ) {
      id
      first_name
      last_name
      email_address
      phone_number
      document_type
      router {
        id
        name
      }
    }
  }
`

export const DELETE_CUSTOMER_MUTATION = `
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id) {
      id
      first_name
    }
  }
`

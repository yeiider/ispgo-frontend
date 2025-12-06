export const SERVICES_QUERY = `
  query GetServices(
    $first: Int!, 
    $page: Int,
    $service_ip: String,
    $service_status: String,
    $sn: String
  ) {
    services(
      first: $first, 
      page: $page,
      service_ip: $service_ip,
      service_status: $service_status,
      sn: $sn
    ) {
      data {
        id
        service_ip
        service_status
        activation_date
        sn
        service_type
        installation_date
        created_at
        updated_at
        customer {
          id
          first_name
          last_name
          email_address
        }
        plan {
          id
          name
          monthly_price
        }
        router {
          id
          name
        }
        address {
          id
          address
          city
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

export const SERVICE_DETAIL_QUERY = `
  query GetService($id: ID!) {
    service(id: $id) {
      id
      service_ip
      service_status
      activation_date
      service_location
      sn
      unu_longitude
      unu_latitude
      service_type
      installation_date
      created_at
      updated_at
      customer {
        id
        first_name
        last_name
        email_address
        phone_number
      }
      plan {
        id
        name
        monthly_price
        download_speed
        upload_speed
      }
      router {
        id
        name
      }
      address {
        id
        address
        city
        state_province
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

export const CREATE_SERVICE_MUTATION = `mutation CreateService($customer_id: Int!, $plan_id: Int!, $router_id: Int!, $service_ip: String!, $service_location: Int!, $service_status: String, $sn: String, $unu_longitude: String, $unu_latitude: String, $service_type: String, $activation_date: DateTime, $installation_date: DateTime) { createService(customer_id: $customer_id, plan_id: $plan_id, router_id: $router_id, service_ip: $service_ip, service_location: $service_location, service_status: $service_status, sn: $sn, unu_longitude: $unu_longitude, unu_latitude: $unu_latitude, service_type: $service_type, activation_date: $activation_date, installation_date: $installation_date) { id service_ip service_status sn service_type router { id name } customer { first_name } address { id address } } }`

export const UPDATE_SERVICE_MUTATION = `mutation UpdateService($id: ID!, $service_ip: String, $service_status: String, $plan_id: Int, $router_id: Int, $service_location: Int, $sn: String, $unu_longitude: String, $unu_latitude: String, $service_type: String, $activation_date: DateTime, $installation_date: DateTime) { updateService(id: $id, service_ip: $service_ip, service_status: $service_status, plan_id: $plan_id, router_id: $router_id, service_location: $service_location, sn: $sn, unu_longitude: $unu_longitude, unu_latitude: $unu_latitude, service_type: $service_type, activation_date: $activation_date, installation_date: $installation_date) { id service_ip service_status sn service_type router { id name } address { id address } } }`

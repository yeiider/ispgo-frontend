export const TICKETS_QUERY = `
  query GetTickets(
    $status: String, 
    $priority: String, 
    $customerId: ID, 
    $serviceId: ID, 
    $title: String,
    $first: Int,
    $page: Int
  ) {
    tickets(
      status: $status
      priority: $priority
      customer_id: $customerId
      service_id: $serviceId
      title: $title
      first: $first
      page: $page
    ) {
      paginatorInfo {
        count
        currentPage
        total
        lastPage
        hasMorePages
      }
      data {
        id
        title
        description
        status
        priority
        issue_type
        contact_method
        closed_at
        created_at
        updated_at
        customer {
          id
          first_name
          last_name
          email_address
        }
        service {
          id
          service_ip
          service_status
        }
        users {
          id
          name
          email
        }
        labels {
          name
          color
        }
        comments {
          id
          comment
          is_internal
          created_at
          user {
            id
            name
          }
        }
        attachments {
          id
          file_name
          file_path
          file_type
          file_size
          created_at
          user {
            id
            name
          }
        }
      }
    }
  }
`

export const TICKET_QUERY = `
  query GetTicket($id: ID!) {
    ticket(id: $id) {
      id
      title
      description
      status
      priority
      issue_type
      contact_method
      resolution_notes
      closed_at
      created_at
      updated_at
      customer {
        id
        first_name
        last_name
        email_address
        phone_number
      }
      service {
        id
        service_ip
        service_status
        plan {
          name
        }
      }
      users {
        id
        name
        email
        roles {
          id
          name
        }
      }
      labels {
        name
        color
      }
      comments {
        id
        comment
        is_internal
        created_at
        user {
          id
          name
        }
      }
      attachments {
        id
        file_name
        file_path
        file_type
        file_size
        created_at
        user {
          id
          name
        }
      }
    }
  }
`

export const MY_TICKETS_QUERY = `
  query GetMyTickets {
    myTickets {
      id
      title
      description
      status
      priority
      issue_type
      created_at
      customer {
        id
        first_name
        last_name
      }
      service {
        id
        service_ip
      }
      labels {
        name
        color
      }
    }
  }
`

export const CREATE_TICKET_MUTATION = `
  mutation CreateTicket(
    $customer_id: ID
    $service_id: ID
    $issue_type: String!
    $priority: String!
    $status: String
    $title: String!
    $description: String!
    $contact_method: String
    $user_ids: [ID!]
  ) {
    createTicket(
      customer_id: $customer_id
      service_id: $service_id
      issue_type: $issue_type
      priority: $priority
      status: $status
      title: $title
      description: $description
      contact_method: $contact_method
      user_ids: $user_ids
    ) {
      id
      title
      description
      status
      priority
      issue_type
      created_at
      customer {
        id
        first_name
        last_name
      }
      service {
        id
        service_ip
      }
      users {
        id
        name
        email
      }
      labels {
        name
        color
      }
    }
  }
`

export const UPDATE_TICKET_MUTATION = `
  mutation UpdateTicket(
    $id: ID!
    $customer_id: ID
    $service_id: ID
    $issue_type: String
    $priority: String
    $status: String
    $title: String
    $description: String
    $contact_method: String
    $resolution_notes: String
  ) {
    updateTicket(
      id: $id
      customer_id: $customer_id
      service_id: $service_id
      issue_type: $issue_type
      priority: $priority
      status: $status
      title: $title
      description: $description
      contact_method: $contact_method
      resolution_notes: $resolution_notes
    ) {
      id
      title
      description
      status
      priority
      resolution_notes
      updated_at
    }
  }
`

export const DELETE_TICKET_MUTATION = `
  mutation DeleteTicket($id: ID!) {
    deleteTicket(id: $id) {
      success
      message
    }
  }
`

export const ASSIGN_USERS_TO_TICKET_MUTATION = `
  mutation AssignUsersToTicket($ticketId: ID!, $userIds: [ID!]!) {
    assignUsersToTicket(ticket_id: $ticketId, user_ids: $userIds) {
      id
      title
      users {
        id
        name
        email
        roles {
          id
          name
        }
      }
    }
  }
`

export const ADD_TICKET_COMMENT_MUTATION = `
  mutation AddTicketComment($ticketId: ID!, $comment: String!, $isInternal: Boolean) {
    addTicketComment(
      ticket_id: $ticketId
      comment: $comment
      is_internal: $isInternal
    ) {
      id
      comment
      is_internal
      created_at
      user {
        id
        name
        email
      }
    }
  }
`

export const ADD_TICKET_LABEL_MUTATION = `
  mutation AddTicketLabel($ticketId: ID!, $name: String!, $color: String) {
    addTicketLabel(ticket_id: $ticketId, name: $name, color: $color) {
      id
      labels {
        name
        color
      }
    }
  }
`

export const REMOVE_TICKET_LABEL_MUTATION = `
  mutation RemoveTicketLabel($ticketId: ID!, $name: String!) {
    removeTicketLabel(ticket_id: $ticketId, name: $name) {
      id
      labels {
        name
        color
      }
    }
  }
`

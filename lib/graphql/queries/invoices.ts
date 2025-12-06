export const INVOICES_QUERY = `
  query GetInvoices($first: Int!, $page: Int) {
    invoices(first: $first, page: $page) {
      data {
        id
        increment_id
        total
        status
        issue_date
        due_date
        created_at
        customer {
          id
          first_name
          last_name
        }
        service {
          id
          service_ip
          plan {
            name
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

export const INVOICE_DETAIL_QUERY = `
  query GetInvoice($id: ID!) {
    invoice(id: $id) {
      id
      increment_id
      total
      status
      issue_date
      due_date
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
        plan {
          name
          monthly_price
        }
      }
      items {
        id
        description
        quantity
        unit_price
        subtotal
      }
      adjustments {
        id
        kind
        amount
        label
      }
      creditNotes {
        id
        amount
        reason
        issue_date
      }
      paymentPromises {
        id
        amount
        promise_date
        status
        notes
      }
    }
  }
`

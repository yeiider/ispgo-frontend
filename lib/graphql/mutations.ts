// GraphQL Mutations for Actions

// Customer Actions
export const GENERATE_INVOICE_MUTATION = `
  mutation GenerateInvoice($customerId: ID!, $serviceId: ID) {
    generateInvoice(customer_id: $customerId, service_id: $serviceId) {
      success
      message
      invoice {
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

export const UPDATE_CUSTOMER_STATUS_MUTATION = `
  mutation UpdateCustomerStatus($customerId: ID!, $status: String!) {
    updateCustomerStatus(customer_id: $customerId, status: $status) {
      success
      message
    }
  }
`

// Service Actions
export const ACTIVATE_SERVICE_MUTATION = `
  mutation ActivateService($serviceId: ID!) {
    activateService(service_id: $serviceId) {
      success
      message
    }
  }
`

export const SUSPEND_SERVICE_MUTATION = `
  mutation SuspendService($serviceId: ID!) {
    suspendService(service_id: $serviceId) {
      success
      message
    }
  }
`

// Invoice Actions
export const REGISTER_PAYMENT_MUTATION = `
  mutation RegisterPayment($invoiceId: ID!, $paymentMethod: String!, $notes: String) {
    registerPayment(invoice_id: $invoiceId, payment_method: $paymentMethod, notes: $notes) {
      success
      message
    }
  }
`

export const APPLY_DISCOUNT_MUTATION = `
  mutation ApplyDiscount($invoiceId: ID!, $discount: Float!, $isPercentage: Boolean!, $includeTax: Boolean!) {
    applyDiscount(invoice_id: $invoiceId, discount: $discount, is_percentage: $isPercentage, include_tax: $includeTax) {
      success
      message
    }
  }
`

export const REGISTER_PAYMENT_PROMISE_MUTATION = `
  mutation RegisterPaymentPromise($invoiceId: ID!, $promiseDate: Date!, $notes: String) {
    registerPaymentPromise(invoice_id: $invoiceId, promise_date: $promiseDate, notes: $notes) {
      success
      message
      payment_promise {
        id
        amount
        promise_date
        notes
        status
      }
    }
  }
`

// Base types from GraphQL schema
export interface Customer {
  id: string
  first_name: string
  last_name: string
  email_address?: string
  phone_number?: string
  identity_document?: string
  document_type?: string
  customer_status?: string
  created_at: string
  updated_at: string
  addresses?: Address[]
  services?: Service[]
  invoices?: Invoice[]
  router?: Router
}

export interface Address {
  id: string
  address: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  address_type?: string
  created_at: string
  updated_at: string
  customer?: Customer
}

export interface Service {
  id: string
  service_ip?: string
  plan_id?: number
  service_status?: string
  activation_date?: string
  service_location?: number
  sn?: string
  unu_longitude?: string
  unu_latitude?: string
  service_type?: string
  installation_date?: string
  created_at: string
  updated_at: string
  customer?: Customer
  invoices?: Invoice[]
  plan?: Plan
  router?: Router
  address?: Address
}

export interface Plan {
  id: string
  name: string
  monthly_price: number
  download_speed?: number
  upload_speed?: number
  status?: string
}

export interface Invoice {
  id: string
  increment_id?: string
  total: number
  status: string
  issue_date?: string
  due_date?: string
  created_at: string
  updated_at: string
  customer?: Customer
  service?: Service
  items?: InvoiceItem[]
  adjustments?: InvoiceAdjustment[]
  creditNotes?: CreditNote[]
  paymentPromises?: PaymentPromise[]
}

export interface InvoiceItem {
  id: string
  description?: string
  quantity?: number
  unit_price?: number
  subtotal?: number
  created_at: string
  updated_at: string
  invoice?: Invoice
  service?: Service
}

export interface BillingNovedad {
  id: string
  type: string
  amount: number
  description?: string
  applied: boolean
  effective_period?: string
  created_at: string
  updated_at: string
  service?: Service
  customer?: Customer
  invoice?: Invoice
}

export interface InvoiceAdjustment {
  id: string
  kind: string
  amount: number
  label?: string
  created_at: string
  updated_at: string
  invoice?: Invoice
}

export interface CreditNote {
  id: string
  amount: number
  issue_date?: string
  reason?: string
  created_at: string
  updated_at: string
  invoice?: Invoice
}

export interface PaymentPromise {
  id: string
  amount: number
  promise_date?: string
  notes?: string
  status?: string
  created_at: string
  updated_at: string
  invoice?: Invoice
  customer?: Customer
}

export interface Router {
  id: string
  name: string
}

// Input types for mutations
export interface CreateRouterInput {
  name: string
}

export interface UpdateRouterInput {
  id: string
  name?: string
}

export interface CreatePlanInput {
  name: string
  monthly_price: number
  download_speed?: number
  upload_speed?: number
  status?: string
}

export interface UpdatePlanInput {
  id: string
  name?: string
  monthly_price?: number
  download_speed?: number
  upload_speed?: number
  status?: string
}

export interface CreateCustomerInput {
  first_name: string
  last_name: string
  email_address?: string
  phone_number?: string
  identity_document: string
  document_type: string
  router_id?: number
}

export interface UpdateCustomerInput {
  id: string
  first_name?: string
  last_name?: string
  email_address?: string
  phone_number?: string
  document_type?: string
  router_id?: number
}

export interface CreateServiceInput {
  customer_id: number
  plan_id: number
  router_id: number
  service_ip: string
  service_location: number
  service_status?: string
  sn?: string
  unu_longitude?: string
  unu_latitude?: string
  service_type?: string
  activation_date?: string
  installation_date?: string
}

export interface UpdateServiceInput {
  id: string
  service_ip?: string
  service_status?: string
  plan_id?: number
  router_id?: number
  service_location?: number
  sn?: string
  unu_longitude?: string
  unu_latitude?: string
  service_type?: string
  activation_date?: string
  installation_date?: string
}

export interface CustomerSearchFilters {
  search?: string
  customer_status?: string
}

export interface ServiceSearchFilters {
  search?: string
  service_status?: string
}

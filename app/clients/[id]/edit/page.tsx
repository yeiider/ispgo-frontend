import { MainLayout } from "@/components/layout/main-layout"
import { CustomerEditForm } from "@/components/customers/customer-edit-form"

interface EditCustomerPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { id } = await params

  return (
    <MainLayout>
      <CustomerEditForm customerId={id} />
    </MainLayout>
  )
}

import { MainLayout } from "@/components/layout/main-layout"
import { CustomerDetail } from "@/components/customers/customer-detail"

interface CustomerPageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerPage({ params }: CustomerPageProps) {
  const { id } = await params

  return (
    <MainLayout>
      <CustomerDetail customerId={id} />
    </MainLayout>
  )
}

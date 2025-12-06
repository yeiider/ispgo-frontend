import { MainLayout } from "@/components/layout/main-layout"
import { ServiceNewForm } from "@/components/services/service-new-form"

interface NewServicePageProps {
  searchParams: Promise<{ customer?: string }>
}

export default async function NewServicePage({ searchParams }: NewServicePageProps) {
  const { customer } = await searchParams

  return (
    <MainLayout>
      <ServiceNewForm customerId={customer} />
    </MainLayout>
  )
}

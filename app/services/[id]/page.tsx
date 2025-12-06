import { MainLayout } from "@/components/layout/main-layout"
import { ServiceDetail } from "@/components/services/service-detail"

interface ServicePageProps {
  params: Promise<{ id: string }>
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { id } = await params

  return (
    <MainLayout>
      <ServiceDetail serviceId={id} />
    </MainLayout>
  )
}

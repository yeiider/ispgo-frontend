import { MainLayout } from "@/components/layout/main-layout"
import { ServiceEditForm } from "@/components/services/service-edit-form"

interface EditServicePageProps {
  params: Promise<{ id: string }>
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params

  return (
    <MainLayout>
      <ServiceEditForm serviceId={id} />
    </MainLayout>
  )
}

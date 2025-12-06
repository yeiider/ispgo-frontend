import { MainLayout } from "@/components/layout/main-layout"
import { RouterEditForm } from "@/components/routers/router-edit-form"

interface RouterEditPageProps {
  params: Promise<{ id: string }>
}

export default async function RouterEditPage({ params }: RouterEditPageProps) {
  const { id } = await params
  return (
    <MainLayout>
      <RouterEditForm routerId={id} />
    </MainLayout>
  )
}

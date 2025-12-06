import { MainLayout } from "@/components/layout/main-layout"
import { RouterDetail } from "@/components/routers/router-detail"

interface RouterDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RouterDetailPage({ params }: RouterDetailPageProps) {
  const { id } = await params
  return (
    <MainLayout>
      <RouterDetail routerId={id} />
    </MainLayout>
  )
}

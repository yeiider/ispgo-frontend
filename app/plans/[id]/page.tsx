import { MainLayout } from "@/components/layout/main-layout"
import { PlanDetail } from "@/components/plans/plan-detail"

interface PlanPageProps {
  params: Promise<{ id: string }>
}

export default async function PlanPage({ params }: PlanPageProps) {
  const { id } = await params
  return (
    <MainLayout>
      <PlanDetail planId={id} />
    </MainLayout>
  )
}

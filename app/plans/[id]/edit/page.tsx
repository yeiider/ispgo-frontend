import { MainLayout } from "@/components/layout/main-layout"
import { PlanEditForm } from "@/components/plans/plan-edit-form"

interface EditPlanPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const { id } = await params
  return (
    <MainLayout>
      <PlanEditForm planId={id} />
    </MainLayout>
  )
}

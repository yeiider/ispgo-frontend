import { MainLayout } from "@/components/layout/main-layout"
import { ServicesTable } from "@/components/services/services-table"

export default function ServicesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Servicios</h1>
          <p className="text-muted-foreground">Gestiona los servicios de internet de tus clientes</p>
        </div>
        <ServicesTable />
      </div>
    </MainLayout>
  )
}

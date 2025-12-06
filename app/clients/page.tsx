import { MainLayout } from "@/components/layout/main-layout"
import { CustomersTable } from "@/components/customers/customers-table"

export default function ClientsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gestiona todos los clientes de tu ISP</p>
        </div>
        <CustomersTable />
      </div>
    </MainLayout>
  )
}

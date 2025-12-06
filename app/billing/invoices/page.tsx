import { MainLayout } from "@/components/layout/main-layout"
import { InvoicesTable } from "@/components/invoices/invoices-table"

export default function InvoicesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Facturas</h1>
          <p className="text-muted-foreground">Gestiona la facturación de tus clientes</p>
        </div>
        <InvoicesTable />
      </div>
    </MainLayout>
  )
}

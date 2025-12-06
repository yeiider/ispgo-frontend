import { MainLayout } from "@/components/layout/main-layout"
import { InvoiceDetail } from "@/components/invoices/invoice-detail"

interface InvoicePageProps {
  params: Promise<{ id: string }>
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params

  return (
    <MainLayout>
      <InvoiceDetail invoiceId={id} />
    </MainLayout>
  )
}

import { redirect } from "next/navigation"

interface InvoiceRedirectPageProps {
  params: Promise<{ id: string }>
}

export default async function InvoiceRedirectPage({ params }: InvoiceRedirectPageProps) {
  const { id } = await params
  redirect(`/billing/invoices/${id}`)
}

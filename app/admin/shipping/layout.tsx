import { AdminLayout } from '@/components/admin/layout'

export default function ShippingAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}

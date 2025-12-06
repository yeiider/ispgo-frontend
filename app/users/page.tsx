import { MainLayout } from "@/components/layout/main-layout"
import { UsersTable } from "@/components/users/users-table"

export default function UsersPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios del sistema y sus accesos</p>
        </div>
        <UsersTable />
      </div>
    </MainLayout>
  )
}

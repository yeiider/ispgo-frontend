import { MainLayout } from "@/components/layout/main-layout"
import { RolesPermissionsManager } from "@/components/users/roles-permissions-manager"

export default function RolesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Roles y Permisos</h1>
          <p className="text-muted-foreground">Administra los roles del sistema y asigna permisos a cada uno</p>
        </div>
        <RolesPermissionsManager />
      </div>
    </MainLayout>
  )
}

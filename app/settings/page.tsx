import { MainLayout } from "@/components/layout/main-layout"
import { ConfigManager } from "@/components/config/config-manager"

export default function SettingsPage() {
  return (
    <MainLayout>
      <ConfigManager />
    </MainLayout>
  )
}

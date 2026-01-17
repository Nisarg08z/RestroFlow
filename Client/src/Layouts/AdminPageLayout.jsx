import { useState } from "react"
import { Outlet } from "react-router-dom"
import { AdminSidebar, AdminHeader } from "../components/AdminPageComponents"

const AdminPageLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-background text-foreground">

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col lg:ml-64">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-auto text-muted-foreground">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminPageLayout

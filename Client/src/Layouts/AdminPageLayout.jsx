import { Outlet } from "react-router-dom"
import { AdminHeader } from "../components/AdminPageComponents"

const AdminPageLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AdminHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8 animate-in fade-in-50">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminPageLayout

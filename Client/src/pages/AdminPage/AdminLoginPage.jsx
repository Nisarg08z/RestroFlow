import { useState } from "react"
import {
  UtensilsCrossed,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { adminLogin } from "../../utils/api" // ✅ ADMIN API

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // ✅ ADMIN LOGIN API
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await adminLogin({
        email: formData.email,
        password: formData.password,
      })

      // ✅ redirect to admin dashboard
      navigate("/admin/dashboard")
    } catch (error) {
      alert(error.response?.data?.message || "Admin login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    "Manage all restaurants from one dashboard",
    "Approve or reject restaurant requests",
    "Control subscriptions & payments",
    "View platform-wide analytics",
  ]

  return (
    <div className="min-h-screen flex bg-[oklch(0.13_0.005_260)]">

      {/* LEFT SIDE */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto">

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)] mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[oklch(0.7_0.18_45)] rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-[oklch(0.13_0.005_260)]" />
            </div>
            <span className="text-2xl font-bold text-[oklch(0.98_0_0)]">
              RestroFlow Admin
            </span>
          </div>

          <h1 className="text-3xl font-bold text-[oklch(0.98_0_0)] mb-2">
            Admin Login
          </h1>
          <p className="text-[oklch(0.65_0_0)] mb-8">
            Sign in to manage restaurants and platform settings
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-[oklch(0.98_0_0)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="admin@restroflow.com"
                required
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-[oklch(0.22_0.005_260)]
                  border border-[oklch(0.28_0.005_260)]
                  text-[oklch(0.98_0_0)]
                  placeholder:text-[oklch(0.65_0_0)]
                  focus:outline-none focus:ring-2
                  focus:ring-[oklch(0.7_0.18_45)]
                "
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-[oklch(0.98_0_0)] mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  className="
                    w-full px-4 py-3 rounded-lg pr-10
                    bg-[oklch(0.22_0.005_260)]
                    border border-[oklch(0.28_0.005_260)]
                    text-[oklch(0.98_0_0)]
                    placeholder:text-[oklch(0.65_0_0)]
                    focus:outline-none focus:ring-2
                    focus:ring-[oklch(0.7_0.18_45)]
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3 rounded-lg font-medium
                bg-[oklch(0.7_0.18_45)]
                text-[oklch(0.13_0.005_260)]
                hover:bg-orange-400
                transition-colors 
                disabled:opacity-60
              "
            >
              {isLoading ? "Signing in..." : "Sign in as Admin"}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE (SAME LAYOUT, ADMIN CONTENT) */}
      <div className="hidden lg:flex flex-1 bg-[oklch(0.17_0.005_260)] border-l border-[oklch(0.28_0.005_260)] items-center justify-center p-16">
        <div className="max-w-md">

          <h2 className="text-2xl font-bold text-[oklch(0.98_0_0)] mb-4">
            Platform Administration Panel
          </h2>

          <p className="text-[oklch(0.65_0_0)] mb-8">
            Control restaurants, subscriptions, analytics, and platform operations from one place.
          </p>

          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[oklch(0.7_0.18_45)]/10 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-[oklch(0.7_0.18_45)]" />
                </div>
                <span className="text-[oklch(0.98_0_0)]">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

        </div>
      </div>
    </div>
  )
}

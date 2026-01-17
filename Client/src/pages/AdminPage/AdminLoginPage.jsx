import { useState } from "react"
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { adminLogin } from "../../utils/api"
import Logo from "../../assets/logo.png"

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await adminLogin({
        email: formData.email,
        password: formData.password,
      })

      if (response.data?.data) {
        localStorage.setItem("role", "ADMIN")
        if (response.data.data.accessToken) {
          localStorage.setItem("accessToken", response.data.data.accessToken)
        }
        navigate("/admin/dashboard")
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Admin login failed"
      setError(errorMessage)
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
    <div className="min-h-screen flex bg-background">

      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto">

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <img src={Logo} alt="RestroFlow" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-foreground">
              RestroFlow Admin
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Login
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to manage restaurants and platform settings
          </p>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
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
                  bg-input
                  border border-border
                  text-foreground
                  placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2
                  focus:ring-primary
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
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
                    bg-input
                    border border-border
                    text-foreground
                    placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2
                    focus:ring-primary
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3 rounded-lg font-medium
                bg-primary
                text-primary-foreground
                hover:opacity-90
                transition-opacity
                disabled:opacity-60
              "
            >
              {isLoading ? "Signing in..." : "Sign in as Admin"}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-card border-l border-border items-center justify-center p-16">
        <div className="max-w-md">

          <h2 className="text-2xl font-bold text-foreground mb-4">
            Platform Administration Panel
          </h2>

          <p className="text-muted-foreground mb-8">
            Control restaurants, subscriptions, analytics, and platform operations from one place.
          </p>

          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-foreground">
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

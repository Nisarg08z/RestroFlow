import { useState } from "react"
import {
  UtensilsCrossed,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
} from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { restaurantLogin } from "../../utils/api"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await restaurantLogin({
        email: formData.email,
        password: formData.password,
      })

      localStorage.setItem("role", "RESTAURANT")
      navigate("/dashboard")

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactClick = (e) => {
    e.preventDefault()
    if (location.pathname !== "/") {
      navigate("/#contact")
    } else {
      const element = document.getElementById("contact")
      if (element) {
        const offset = 80
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        })
      }
    }
  }

  const features = [
    "QR code ordering system for all tables",
    "Real-time kitchen display for chefs",
    "Complete billing & reporting dashboard",
    "24/7 support and regular updates",
  ]

  return (
    <div className="min-h-screen flex bg-[oklch(0.13_0.005_260)]">

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
              RestroFlow
            </span>
          </div>

          <h1 className="text-3xl font-bold text-[oklch(0.98_0_0)] mb-2">
            Welcome back
          </h1>
          <p className="text-[oklch(0.65_0_0)] mb-8">
            Sign in to access your restaurant dashboard
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

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
                placeholder="you@restaurant.com"
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[oklch(0.98_0_0)]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[oklch(0.7_0.18_45)] hover:text-[oklch(0.7_0.18_45)]/80 transition"
                >
                  Forgot password?
                </Link>
              </div>

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
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-[oklch(0.65_0_0)] text-sm mt-8">
            Don&apos;t have an account?{" "}
            <a
              href="#contact"
              onClick={handleContactClick}
              className="text-[oklch(0.7_0.18_45)] hover:text-[oklch(0.7_0.18_45)]/80 transition cursor-pointer"
            >
              Contact us to get started
            </a>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-[oklch(0.17_0.005_260)] border-l border-[oklch(0.28_0.005_260)] items-center justify-center p-16">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-[oklch(0.98_0_0)] mb-4">
            Your complete restaurant management solution
          </h2>

          <p className="text-[oklch(0.65_0_0)] mb-8">
            Access all dashboards, manage orders, generate reports, and grow your
            business with RestroFlow.
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

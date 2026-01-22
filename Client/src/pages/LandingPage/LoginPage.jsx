import { useState } from "react"
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
} from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { restaurantLogin } from "../../utils/api"
import Logo from "../../assets/logo.png"

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
      const response = await restaurantLogin({
        email: formData.email,
        password: formData.password,
      })

      if (response.data?.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.data.accessToken)
      }

      localStorage.setItem("role", "RESTAURANT")
      localStorage.setItem("showWelcomeAnimation", "true")
      navigate("/restaurant/welcome")

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
              RestroFlow
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access your restaurant dashboard
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
                placeholder="you@restaurant.com"
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:opacity-80 transition"
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
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-8">
            Don&apos;t have an account?{" "}
            <a
              href="#contact"
              onClick={handleContactClick}
              className="text-primary hover:opacity-80 transition cursor-pointer"
            >
              Contact us to get started
            </a>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-card border-l border-border items-center justify-center p-16">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Your complete restaurant management solution
          </h2>

          <p className="text-muted-foreground mb-8">
            Access all dashboards, manage orders, generate reports, and grow your
            business with RestroFlow.
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

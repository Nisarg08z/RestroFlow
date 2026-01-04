import { useState } from "react"
import {
  UtensilsCrossed,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step, setStep] = useState("email")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [showPassword, setShowPassword] = useState(false)
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  })

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    setStep("otp")
  }

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    setStep("reset")
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (passwords.password !== passwords.confirmPassword) return

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    setStep("success")

    setTimeout(() => navigate("/login"), 2000)
  }

  return (
    <div className="min-h-screen flex bg-[oklch(0.13_0.005_260)]">

      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto">

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)] mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[oklch(0.7_0.18_45)] rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-[oklch(0.13_0.005_260)]" />
            </div>
            <span className="text-2xl font-bold text-[oklch(0.98_0_0)]">
              RestroFlow
            </span>
          </div>

          {step === "email" && (
            <>
              <h1 className="text-3xl font-bold text-[oklch(0.98_0_0)] mb-2">
                Forgot Password?
              </h1>
              <p className="text-[oklch(0.65_0_0)] mb-8">
                Enter your email to receive an OTP.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@restaurant.com"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)]
                    border border-[oklch(0.28_0.005_260)]
                    text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)]
                    focus:ring-2 focus:ring-[oklch(0.7_0.18_45)] outline-none"
                />

                <button className="w-full py-3 rounded-lg font-medium
                  bg-[oklch(0.7_0.18_45)] hover:bg-orange-400 transition-colors text-[oklch(0.13_0.005_260)]">
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <h1 className="text-3xl font-bold text-[oklch(0.98_0_0)] mb-2">
                Verify OTP
              </h1>
              <p className="text-[oklch(0.65_0_0)] mb-8">
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex gap-3 justify-center">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      value={d}
                      maxLength={1}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      className="w-12 h-12 text-center rounded-lg
                        bg-[oklch(0.22_0.005_260)]
                        border border-[oklch(0.28_0.005_260)]
                        text-[oklch(0.98_0_0)]
                        focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                    />
                  ))}
                </div>

                <button className="w-full py-3 rounded-lg font-medium
                  bg-[oklch(0.7_0.18_45)] hover:bg-orange-400 transition-colors text-[oklch(0.13_0.005_260)]">
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <h1 className="text-3xl font-bold text-[oklch(0.98_0_0)] mb-6">
                Reset Password
              </h1>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={passwords.password}
                    onChange={(e) =>
                      setPasswords({ ...passwords, password: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 rounded-lg pr-10
                      bg-[oklch(0.22_0.005_260)]
                      border border-[oklch(0.28_0.005_260)]
                      text-[oklch(0.98_0_0)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>

                <input
                  type="password"
                  placeholder="Confirm password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-lg
                    bg-[oklch(0.22_0.005_260)]
                    border border-[oklch(0.28_0.005_260)]
                    text-[oklch(0.98_0_0)]"
                />

                <button className="w-full py-3 rounded-lg font-medium
                  bg-[oklch(0.7_0.18_45)] hover:bg-orange-400 transition-colors text-[oklch(0.13_0.005_260)]">
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-[oklch(0.7_0.18_45)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-[oklch(0.7_0.18_45)]" />
              </div>
              <h2 className="text-2xl font-bold text-[oklch(0.98_0_0)] mb-2">
                Password Reset Successful
              </h2>
              <p className="text-[oklch(0.65_0_0)]">
                Redirecting to login...
              </p>
            </div>
          )}

        </div>
      </div>


      <div className="hidden lg:flex flex-1 bg-[oklch(0.17_0.005_260)]
        border-l border-[oklch(0.28_0.005_260)]
        items-center justify-center p-16">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-[oklch(0.98_0_0)] mb-4">
            Secure Account Recovery
          </h2>
          <p className="text-[oklch(0.65_0_0)]">
            Verify your identity with OTP and safely reset your password.
          </p>
        </div>
      </div>

    </div>
  )
}

import { useState } from "react"
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { requestPasswordReset, verifyOTP, resetPassword } from "../../utils/api"
import toast from "react-hot-toast"
import Logo from "../../assets/logo.png"

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
    try {
      await requestPasswordReset({ email })
      toast.success("OTP sent to your email")
      setStep("otp")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
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
    if (otp.join("").length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)
    try {
      await verifyOTP({ email, otp: otp.join("") })
      setStep("reset")
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (passwords.password !== passwords.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      await resetPassword({
        email,
        otp: otp.join(""),
        newPassword: passwords.password
      })
      setStep("success")
      setTimeout(() => navigate("/login"), 2000)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">

      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto">

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <img src={Logo} alt="RestroFlow" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-foreground">
              RestroFlow
            </span>
          </div>

          {step === "email" && (
            <>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Forgot Password?
              </h1>
              <p className="text-muted-foreground mb-8">
                Enter your email to receive an OTP.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@restaurant.com"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-input
                    border border-border
                    text-foreground placeholder:text-muted-foreground
                    focus:ring-2 focus:ring-primary outline-none"
                />

                <button className="w-full py-3 rounded-lg font-medium
                  bg-primary hover:opacity-90 transition-colors text-primary-foreground">
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Verify OTP
              </h1>
              <p className="text-muted-foreground mb-8">
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
                        bg-input
                        border border-border
                        text-foreground
                        focus:ring-2 focus:ring-primary"
                    />
                  ))}
                </div>

                <button className="w-full py-3 rounded-lg font-medium
                  bg-primary hover:opacity-90 transition-colors text-primary-foreground">
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <h1 className="text-3xl font-bold text-foreground mb-6">
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
                      bg-input
                      border border-border
                      text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    bg-input
                    border border-border
                    text-foreground"
                />

                <button className="w-full py-3 rounded-lg font-medium
                  bg-primary hover:opacity-90 transition-colors text-primary-foreground">
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Password Reset Successful
              </h2>
              <p className="text-muted-foreground">
                Redirecting to login...
              </p>
            </div>
          )}

        </div>
      </div>


      <div className="hidden lg:flex flex-1 bg-card
        border-l border-border
        items-center justify-center p-16">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Secure Account Recovery
          </h2>
          <p className="text-muted-foreground">
            Verify your identity with OTP and safely reset your password.
          </p>
        </div>
      </div>

    </div>
  )
}

import { useState } from "react"
import { Menu, X, UtensilsCrossed } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleSectionClick = (e, sectionId) => {
    e.preventDefault()
    
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`)
    } else {
      const element = document.getElementById(sectionId)
      if (element) {
        const offset = 80
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }
    setIsMenuOpen(false)
  }

  return (
    <nav
      className="
        fixed top-0 left-0 right-0 z-50
        bg-[oklch(0.13_0.005_260)]/80
        backdrop-blur-md
        border-b border-[oklch(0.28_0.005_260)]
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[oklch(0.7_0.18_45)]  rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-[oklch(0.13_0.005_260)]" />
            </div>
            <span className="text-xl font-bold text-[oklch(0.98_0_0)]">
              RestroFlow
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              onClick={(e) => handleSectionClick(e, 'features')}
              className="text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)] transition cursor-pointer"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleSectionClick(e, 'how-it-works')}
              className="text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)] transition cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#dashboards"
              onClick={(e) => handleSectionClick(e, 'dashboards')}
              className="text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)] transition cursor-pointer"
            >
              Dashboards
            </a>
            <a
              href="#contact"
              onClick={(e) => handleSectionClick(e, 'contact')}
              className="text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)] transition cursor-pointer"
            >
              Contact
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-[oklch(0.98_0_0)] hover:bg-[oklch(0.22_0.005_260)] transition"
            >
              Log in
            </Link>
            <a
              href="#contact"
              onClick={(e) => handleSectionClick(e, 'contact')}
              className="
                px-5 py-2 rounded-lg font-medium
                bg-[oklch(0.7_0.18_45)]
                hover:bg-orange-400 transition-colors
                text-[oklch(0.13_0.005_260)]
                hover:bg-[oklch(0.7_0.18_45)]/90
                cursor-pointer
              "
            >
              Get Started
            </a>
          </div>

          <button
            className="md:hidden text-[oklch(0.98_0_0)]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-[oklch(0.13_0.005_260)] border-b border-[oklch(0.28_0.005_260)]">
          <div className="px-4 py-4 space-y-4">
            <a
              href="#features"
              onClick={(e) => handleSectionClick(e, 'features')}
              className="block text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)] cursor-pointer"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleSectionClick(e, 'how-it-works')}
              className="block text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)] cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#dashboards"
              onClick={(e) => handleSectionClick(e, 'dashboards')}
              className="block text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)] cursor-pointer"
            >
              Dashboards
            </a>
            <a
              href="#contact"
              onClick={(e) => handleSectionClick(e, 'contact')}
              className="block text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)] cursor-pointer"
            >
              Contact
            </a>

            <div className="pt-4 space-y-2">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-4 py-2 rounded-lg text-[oklch(0.98_0_0)] hover:bg-[oklch(0.22_0.005_260)] transition"
              >
                Log in
              </Link>
              <a
                href="#contact"
                onClick={(e) => handleSectionClick(e, 'contact')}
                className="
                  block w-full text-center px-4 py-2 rounded-lg font-medium
                  bg-[oklch(0.7_0.18_45)]
                  text-[oklch(0.13_0.005_260)]
                  hover:bg-[oklch(0.7_0.18_45)]/90
                  transition cursor-pointer
                "
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar;

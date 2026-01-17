import { Link, useNavigate, useLocation } from "react-router-dom"
import Logo from "../../assets/logo.png"

const Footer = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleScrollToTop = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
  }

  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto">

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" onClick={handleScrollToTop} className="flex items-center gap-2 mb-4">
              <img src={Logo} alt="RestroFlow" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-foreground">
                RestroFlow
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              The complete restaurant management platform for modern dining
              experiences.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleSectionClick(e, 'features')}
                  className="text-muted-foreground hover:text-foreground text-sm transition cursor-pointer"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#dashboards"
                  onClick={(e) => handleSectionClick(e, 'dashboards')}
                  className="text-muted-foreground hover:text-foreground text-sm transition cursor-pointer"
                >
                  Dashboards
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleSectionClick(e, 'how-it-works')}
                  className="text-muted-foreground hover:text-foreground text-sm transition cursor-pointer"
                >
                  How It Works
                </a>
              </li>

            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about-us"
                  className="text-muted-foreground hover:text-foreground text-sm transition cursor-pointer"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleSectionClick(e, 'contact')}
                  className="text-muted-foreground hover:text-foreground text-sm transition cursor-pointer"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-muted-foreground hover:text-foreground text-sm transition cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-muted-foreground hover:text-foreground text-sm transition cursor-pointer"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookie-policy"
                  className="text-muted-foreground hover:text-foreground text-sm transition cursor-pointer"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © 2026 RestroFlow. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground text-sm transition"
            >
              Twitter
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground text-sm transition"
            >
              LinkedIn
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground text-sm transition"
            >
              Instagram
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer;

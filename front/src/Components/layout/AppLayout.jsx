import { useState, useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import logoMain from "../../services/logo_main.png";
import LogoSpin from "../LogoSpin";
import { useAuth } from "../../contexts/AuthContext";
import { useLogout } from "../../hooks/useLogout";
import NotificationBell from "../NotificationBell";

const SUBTITLE = "Votre emploi du temps en ligne";

function navLinkClass(scrolled, isActive) {
  const base = scrolled
    ? "text-gray-800 hover:text-orange-600 hover:bg-orange-50/80"
    : "text-gray-700 hover:text-orange-600 hover:bg-orange-50";
  const active = isActive ? " text-orange-600 bg-orange-50" : "";
  return `text-sm font-medium px-3 py-2 rounded-md transition-all duration-200 ${base}${active}`;
}

export default function AppLayout({
  homePath,
  navItems = [],
  footerTagline = "Plateforme pour étudiants",
  showLogout = true,
  showNotifications = true,
}) {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const handleLogout = useLogout();
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const canLogout = showLogout && user;

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-md shadow-lg" : "bg-white shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div
                className={`w-20 h-20 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 ${
                  scrolled ? "bg-white/90" : "bg-white"
                }`}
              >
                <Link to={homePath}>
                  <img
                    src={logoMain}
                    alt="Sup2iEmploi Logo"
                    className="w-15 h-15 cursor-pointer"
                  />
                </Link>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-blue-950 transition-all duration-300">
                  ICTAP
                </h1>
                <p
                  className={`text-sm transition-all duration-300 ${
                    scrolled ? "text-gray-600" : "text-gray-500"
                  }`}
                >
                  {SUBTITLE}
                </p>
              </div>
            </div>

            <LogoSpin />

            <nav className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end flex-wrap">
              {showNotifications && user && <NotificationBell />}
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => navLinkClass(scrolled, isActive)}
                >
                  {item.label}
                </NavLink>
              ))}
              {canLogout && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="relative flex-grow bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <main className="relative z-10 flex-grow">
          <Outlet />
        </main>
      </div>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <img src={logoMain} alt="Logo" className="w-15 h-15" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-950">ICTAP</h3>
                  <p className="text-sm text-gray-500">{SUBTITLE}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} ICTAP • {footerTagline}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Service proposé par l&apos;école ICTAP
              </p>
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600">
                Développé par{" "}
                <a
                  href="www"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
                >
                  Benfarhoun et Boutaghi
                </a>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Développé avec passion et dévouement
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



// src/components/Header.tsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

export default function Header() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const { user, loading } = useAuth();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

  // Handle scroll effect for transparent to solid header transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setIsOpen(false);
      setUserMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Check if a nav link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white dark:bg-gray-900 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <span className={`text-2xl font-bold ${
                scrolled ? "text-indigo-600 dark:text-indigo-400" : "text-white"
              }`}>
                GlobeGuide
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { name: "Home", path: "/" },
              { name: "Countries", path: "/countries" },
              { name: "Regions", path: "/regions" },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                    : scrolled
                    ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {!loading && (
              <>
                {user ? (
                  <div className="relative ml-4">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                        scrolled
                          ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden lg:block">
                        {user.email?.split("@")[0]}
                      </span>
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={userMenuOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                        />
                      </svg>
                    </button>

                    {/* User Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                          Signed in as <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>
                        </div>
                        <Link
                          to="/favorites"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Favorites
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 ml-4">
                    <Link
                      to="/auth/login"
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                        scrolled
                          ? "text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/auth/register"
                      className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${
                scrolled
                  ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  : "text-white hover:bg-white/10"
              }`}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {[
              { name: "Home", path: "/" },
              { name: "Countries", path: "/countries" },
              { name: "Regions", path: "/regions" },
              { name: "About", path: "/about" }
            ].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {!loading && (
              <>
                {user ? (
                  <>
                    <div className="block px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-400">
                      Signed in as <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/favorites"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsOpen(false)}
                    >
                      Favorites
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center px-3">
                      <div className="space-y-2 w-full">
                        <Link
                          to="/auth/login"
                          className="block w-full px-3 py-2 rounded-md text-base font-medium text-center text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                          onClick={() => setIsOpen(false)}
                        >
                          Log in
                        </Link>
                        <Link
                          to="/auth/register"
                          className="block w-full px-3 py-2 rounded-md text-base font-medium text-center text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                          onClick={() => setIsOpen(false)}
                        >
                          Sign up
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

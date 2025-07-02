"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ButtonLogout from "./ButtonLogout";
import { Menu, X } from "lucide-react";
import { getDashboardUrl } from "@/helpers/auth";
import { useAuthState } from "@/hooks/useAuthState";

export default function NavbarLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoggedIn, userRole, loading } = useAuthState();

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 shadow-xl border-b border-blue-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3">
              <Image
                src="/testoria.svg"
                alt="Testoria Logo"
                width={80}
                height={80}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8"></div>

          {/* Desktop User Actions */}
          {loading ? (
            // Loading state
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-600 animate-pulse rounded"></div>
              <div className="w-20 h-8 bg-gray-600 animate-pulse rounded"></div>
            </div>
          ) : isLoggedIn ? (
            // Authenticated user navigation
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href={getDashboardUrl(userRole)}
                className="px-4 py-2 text-white hover:text-blue-400 font-medium transition-colors duration-200"
              >
                Dashboard
              </Link>
              {userRole === "creator" && (
                <Link
                  href="/profile"
                  className="px-4 py-2 text-white hover:text-blue-400 font-medium transition-colors duration-200"
                >
                  Profile
                </Link>
              )}
              <ButtonLogout />
            </div>
          ) : (
            // Unauthenticated user navigation
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-white hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Daftar
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-blue-800/30">
            <div className="px-4 py-4 space-y-4">
              {loading ? (
                <div className="space-y-2">
                  <div className="w-full h-8 bg-gray-600 animate-pulse rounded"></div>
                  <div className="w-full h-8 bg-gray-600 animate-pulse rounded"></div>
                </div>
              ) : isLoggedIn ? (
                <div className="space-y-4">
                  <Link
                    href={getDashboardUrl(userRole)}
                    className="block px-4 py-2 text-white hover:text-blue-400 font-medium transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {userRole === "creator" && (
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-white hover:text-blue-400 font-medium transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  )}
                  <div className="px-4">
                    <ButtonLogout />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-white hover:text-blue-400 font-medium transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

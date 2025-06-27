"use client";

import Image from "next/image";
import Link from "next/link";

export default function NavbarLanding() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
            <div className="flex items-center space-x-3">
                      <Image 
                      src="/testoria.svg"
                      alt="Testoria Logo"
                      width={80}
                      height={80}
                      />
                    </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8"></div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

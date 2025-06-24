'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="bg-[#f9fafb] shadow-sm fixed top-0 left-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <span className="text-2xl font-semibold text-[#3b82f6] tracking-tight">
                            Testoria
                        </span>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="text-[#374151] hover:text-[#3b82f6] font-medium">Home</Link>
                        <Link href="/packages" className="text-[#374151] hover:text-[#3b82f6] font-medium">Packages</Link>
                        <Link href="/login" className="text-[#4b5563] hover:text-[#3b82f6]">Login</Link>
                        <Link
                            href="/register"
                            className="bg-[#3b82f6] text-white px-4 py-2 rounded-md hover:bg-[#2563eb] transition"
                        >
                            Register
                        </Link>
                    </div>

                    {/* Mobile menu toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-[#4b5563] hover:text-[#3b82f6] focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-[#f9fafb] px-4 pt-2 pb-4 space-y-2 shadow-sm">
                    <Link href="/" className="block text-[#374151] hover:text-[#3b82f6]">Home</Link>
                    <Link href="/packages" className="block text-[#374151] hover:text-[#3b82f6]">Packages</Link>
                    <Link href="/login" className="block text-[#4b5563] hover:text-[#3b82f6]">Login</Link>
                    <Link
                        href="/register"
                        className="block bg-[#3b82f6] text-white px-3 py-2 rounded-md hover:bg-[#2563eb]"
                    >
                        Register
                    </Link>
                </div>
            )}
        </nav>
    )
}
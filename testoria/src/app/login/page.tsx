'use client'

import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (response.ok) {
                toast.success(data.message || 'Login successful!')
                setFormData({
                    email: '',
                    password: ''
                })
                // Navigate to dashboard or home after successful login
                setTimeout(() => {
                    router.push('/')
                }, 1500)
            } else {
                toast.error(data.message || 'Login failed')
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const features = [
        {
            icon: Shield,
            title: "High-Quality Practice Questions",
            description: "Access to premium questions from trusted and experienced sources"
        },
        {
            icon: Users,
            title: "Automated PDF Processing",
            description: "Upload questions from PDF files with automated conversion system"
        },
        {
            icon: Zap,
            title: "Auto-Grading & Analysis",
            description: "Instant results with AI-generated analysis and detailed explanations"
        }
    ]

    return (
        <div className="min-h-screen bg-[#f9fafb] pt-16">
            <div className="flex">
                {/* Left Side - Features Section */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] p-12 flex-col justify-center">
                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold text-white mb-6">
                            Welcome back to
                            <span className="block text-[#93c5fd]">Testoria</span>
                        </h1>
                        <p className="text-[#bfdbfe] text-lg mb-12">
                            Online tryout platform with timed tests, automatic grading, and comprehensive explanations. Join thousands of users improving their skills.
                        </p>

                        <div className="space-y-8">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                                        <p className="text-[#bfdbfe] text-sm">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
                            <h4 className="text-white font-medium mb-3">User Roles Available:</h4>
                            <div className="space-y-2 text-sm text-[#bfdbfe]">
                                <p>• <span className="text-white">Digital Creators:</span> Upload & monetize question packages</p>
                                <p>• <span className="text-white">Customers:</span> Purchase packages & take timed tests</p>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
                            <p className="text-white text-sm italic">
                                "Testoria transformed my exam preparation. The automated grading and AI analysis helped me identify weak areas and improve my scores significantly."
                            </p>
                            <div className="mt-3 flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                                <div>
                                    <p className="text-white text-sm font-medium">Ahmad Rizki</p>
                                    <p className="text-[#bfdbfe] text-xs">University Student</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        {/* Mobile Header - only visible on small screens */}
                        <div className="lg:hidden text-center mb-8">
                            <h2 className="text-3xl font-bold text-[#374151]">Welcome Back</h2>
                            <p className="text-[#4b5563] mt-2">Sign in to your Testoria account</p>
                        </div>

                        {/* Desktop Header */}
                        <div className="hidden lg:block text-center mb-8">
                            <h2 className="text-3xl font-bold text-[#374151]">Sign In</h2>
                            <p className="text-[#4b5563] mt-2">Access your account</p>
                        </div>

                        {/* Login Form */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-[#9ca3af]" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-[#374151] placeholder-[#9ca3af] transition"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-[#374151] mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-[#9ca3af]" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-[#374151] placeholder-[#9ca3af] transition"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-[#9ca3af] hover:text-[#374151] transition" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-[#9ca3af] hover:text-[#374151] transition" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-[#3b82f6] focus:ring-[#3b82f6] border-gray-300 rounded"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-[#4b5563]">
                                            Remember me
                                        </label>
                                    </div>
                                    <div className="text-sm">
                                        <Link href="#" className="font-medium text-[#3b82f6] hover:text-[#2563eb] transition">
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#3b82f6] text-white py-3 px-4 rounded-lg hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    <span className="flex items-center justify-center">
                                        {isLoading ? 'Signing In...' : (
                                            <>
                                                Sign In
                                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-[#4b5563]">New to Testoria?</span>
                                    </div>
                                </div>
                            </div>

                            {/* Register Link */}
                            <div className="mt-6">
                                <Link
                                    href="/register"
                                    className="w-full flex justify-center items-center px-4 py-3 border border-[#3b82f6] rounded-lg text-[#3b82f6] bg-white hover:bg-[#f0f9ff] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 transition duration-200 font-medium group"
                                >
                                    Create new account
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#fff',
                        color: '#374151',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </div>
    )
}

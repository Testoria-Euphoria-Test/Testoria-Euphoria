"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Users,
  Zap,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
//jika user sudah login, redirect ke halaman dashboard sesuai dengan role user
  if (typeof window !== "undefined") {
    const userRole = document.cookie
      .split("; ")
      .find((row) => row.startsWith("x-user-role="))
      ?.split("=")[1];
    if (userRole) {
      if (userRole === "admin") {
        window.location.href = "/dashboard-admin";
      } else if (userRole === "creator") {
        window.location.href = "/dashboard-creator";
      } else if (userRole === "customer") {
        window.location.href = "/dashboard-customer";
      }
    }
  }
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Login successful!");
        setFormData({
          email: "",
          password: "",
        });
        // Navigate to dashboard or home after successful login
        // jika cookies sudah di set, dan berisi role admin, redirect ke dashboard admin
        // jika role customer, redirect ke halaman customer
        // jika role creator, redirect ke halaman creator
        const userRole = document.cookie
          .split("; ")
          .find((row) => row.startsWith("x-user-role="))
          ?.split("=")[1];
        if (userRole === "admin") {
          router.push("/dashboard-admin");
        } else if (userRole === "creator") {
          router.push("/dashboard-creator");
        } else if (userRole === "customer") {
          router.push("/dashboard-customer");
        }
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error((error as Error).message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: "High-Quality Practice Questions",
      description:
        "Access to premium questions from trusted and experienced sources",
    },
    {
      icon: Users,
      title: "Automated PDF Processing",
      description:
        "Upload questions from PDF files with automated conversion system",
    },
    {
      icon: Zap,
      title: "Auto-Grading & Analysis",
      description:
        "Instant results with AI-generated analysis and detailed explanations",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="flex min-h-screen">
        {/* Left Side - Features Section */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
          }}></div>
          
          <div className="max-w-md relative z-10">
            {/* Logo */}
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Testoria</h1>
            </div>

            <h1 className="text-4xl font-bold text-white mb-6">
              Welcome back to
              <span className="block text-blue-400">Testoria</span>
            </h1>
            <p className="text-blue-100 text-lg mb-12">
              Platform try out online terpercaya untuk persiapan ujian UTBK, CPNS, SNBT, dan Kedinasan dengan sistem pembelajaran yang interaktif.
            </p>

            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <h4 className="text-white font-medium mb-3">
                User Roles Available:
              </h4>
              <div className="space-y-2 text-sm text-blue-100">
                <p>
                  • <span className="text-white">Digital Creators:</span> Upload
                  & monetize question packages
                </p>
                <p>
                  • <span className="text-white">Customers:</span> Purchase
                  packages & take timed tests
                </p>
              </div>
            </div>


          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile Logo - only visible on small screens */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Testoria</h1>
            </div>

            {/* Mobile Header - only visible on small screens */}
            <div className="lg:hidden text-center mb-8">
              <h2 className="text-3xl font-bold text-[#374151]">
                Welcome Back
              </h2>
              <p className="text-[#6b7280] mt-2">
                Sign in to your Testoria account
              </p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-3xl font-bold text-[#374151]">Sign In</h2>
              <p className="text-[#6b7280] mt-2">Access your account</p>
            </div>

            {/* Login Form */}
            <div className="space-y-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#374151] mb-2"
                  >
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
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-[#374151] placeholder-[#9ca3af] transition"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#374151] mb-2"
                  >
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
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-[#4b5563]"
                    >
                      Remember me
                    </label>
                  </div>

                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#3b82f6] text-white py-3 px-4 rounded-lg hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-[#6b7280]">
                    New to Testoria?
                  </span>
                </div>
              </div>

              {/* Register Link */}
              <Link
                href="/register"
                className="w-full flex justify-center items-center px-4 py-3 border border-[#3b82f6] rounded-lg text-[#3b82f6] bg-white hover:bg-[#f0f9ff] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 transition duration-200 font-semibold group"
              >
                Create new account
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Mobile Features - only visible on small screens */}
            <div className="lg:hidden mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Why Choose Testoria?</h3>
              <div className="space-y-4">
                {features.slice(0, 2).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{feature.title}</h4>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
}
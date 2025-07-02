"use client";

import { useState } from "react";
import { User, Mail, Lock, UserCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer" as "customer" | "creator",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password tidak cocok");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Pendaftaran berhasil!");
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "customer",
        });
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        toast.error(data.message || "Pendaftaran gagal");
      }
    } catch (error) {
      console.log("Registration error:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#3b82f6] rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-[#1f2a44] tracking-tight">
            Buat Akun
          </h2>
          <p className="text-[#6b7280] mt-2 text-sm">
            Bergabung dengan Testoria hari ini
          </p>
        </div>
        {/* Form */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#1f2a44] mb-1"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[#9ca3af]" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#3b82f6] text-[#1f2a44] placeholder-[#9ca3af] text-sm"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#1f2a44] mb-1"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#9ca3af]" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#3b82f6] text-[#1f2a44] placeholder-[#9ca3af] text-sm"
                  placeholder="Masukkan email Anda"
                />
              </div>
            </div>

            {/* Role Field */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-[#1f2a44] mb-1"
              >
                Akun Sebagai
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#3b82f6] text-[#1f2a44] text-sm bg-white"
              >
                <option value="customer">Pelanggan</option>
                <option value="creator">Pembuat Konten</option>
              </select>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#1f2a44] mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#9ca3af]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#3b82f6] text-[#1f2a44] placeholder-[#9ca3af] text-sm"
                  placeholder="Masukkan password Anda"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[#9ca3af] hover:text-[#3b82f6]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#9ca3af] hover:text-[#3b82f6]" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[#1f2a44] mb-1"
              >
                Konfirmasi Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#9ca3af]" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#3b82f6] text-[#1f2a44] placeholder-[#9ca3af] text-sm"
                  placeholder="Konfirmasi password Anda"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-[#9ca3af] hover:text-[#3b82f6]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#9ca3af] hover:text-[#3b82f6]" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3b82f6] text-white py-2 px-4 rounded-md hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 transition duration-150 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Membuat Akun..." : "Buat Akun"}
            </button>
          </form>
          {/* Login Link */}
          <div className="mt-5 text-center">
            <p className="text-sm text-[#6b7280]">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-medium text-[#3b82f6] hover:text-[#1d4ed8] transition duration-150"
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

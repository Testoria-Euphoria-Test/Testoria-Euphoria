"use client";

import {
  Clock,
  BookOpen,
  ShoppingCart,
  ArrowLeft,
  User,
  Tag,
  FileText,
  Mail,
  Award,
} from "lucide-react";
import Link from "next/link";
import { PackageResponse } from "@/types/package";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// Extended interface for package with details
interface PackageWithDetails extends PackageResponse {
  category?: {
    name: string;
    _id: string;
  };
  creator?: {
    name: string;
    email: string;
    role: string;
    _id: string;
  };
  creatorProfile?: {
    _id: string;
    photoUrl?: string;
    education?: string;
    certificates?: string[];
    bio?: string;
  };
  categoryName?: string;
  creatorName?: string;
}

export default function PackagePageDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [packageData, setPackageData] = useState<PackageWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [id, setId] = useState<string>("");
  const router = useRouter();

  // Handler for enroll button
  const handleEnroll = () => {
    if (!isLoggedIn) {
      toast.error("Anda harus login terlebih dahulu untuk mendaftar");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
      return;
    }

    // If logged in, handle enrollment logic here
    // For now, just show a message
    toast.success("Redirecting to enrollment...");
  };

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Check auth status
        const authResponse = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        setIsLoggedIn(authResponse.ok);

        // Fetch package data
        const uri = `http://localhost:3000/api/packages/${id}?withDetails=true`;
        const response = await fetch(uri);
        const result = await response.json();
        setPackageData(result.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Navbar showUserActions={false} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat detail paket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div>
        <Navbar showUserActions={false} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Paket tidak ditemukan</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions
  const formatPrice = (price: number) => {
    if (price === 0) return "GRATIS";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (duration: number) => {
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${duration} menit`;
  };

  // Get jumlah pertanyaan dari contents
  const totalQuestions = packageData.contents?.length || 0;

  return (
    <div>
      <Navbar showUserActions={isLoggedIn} />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href={isLoggedIn ? "/dashboard-customer" : "/"}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {isLoggedIn ? "Kembali ke Dashboard" : "Kembali ke Beranda"}
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Package Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                  {(packageData.category?.name || packageData.categoryName) && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      <Tag className="w-4 h-4 mr-1" />
                      {packageData.category?.name || packageData.categoryName}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {packageData.title}
                </h1>

                <p className="text-gray-600 text-lg leading-relaxed">
                  {packageData.description}
                </p>
              </div>

              {/* Package Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Informasi Paket
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Total Questions */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <BookOpen className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-semibold text-green-900">
                        Total Soal
                      </h3>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {totalQuestions}
                    </div>
                    <div className="text-sm text-green-600">
                      Soal tersedia
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Clock className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold text-blue-900">Durasi</h3>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {formatDuration(packageData.duration)}
                    </div>
                    <div className="text-sm text-blue-600">Batas waktu</div>
                  </div>
                </div>
              </div>

              {/* Creator Profile */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-600" />
                  Profil Creator
                </h2>

                <div className="flex items-start space-x-4">
                  {/* Creator Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>

                  {/* Creator Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {packageData.creator?.name ||
                          packageData.creatorName ||
                          "Pembuat Tidak Diketahui"}
                      </h3>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        {packageData.creator?.role || "Pembuat"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>
                          {packageData.creator?.email || "Email tidak tersedia"}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Award className="w-4 h-4 mr-2" />
                        <span>
                          Peran: {packageData.creator?.role || "Creator"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Purchase Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formatPrice(packageData.price)}
                    </div>
                    <p className="text-gray-600">
                      {packageData.price === 0
                        ? "Gratis Akses"
                        : "Sekali Bayar"}
                    </p>
                  </div>

                  <button
                    onClick={handleEnroll}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center mb-4"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {packageData.price === 0 ? "Mulai Gratis" : "Daftar Sekarang"}
                  </button>

                  {(packageData.creatorProfile?._id || packageData.creator?._id) && (
                    <Link
                      href={packageData.creatorProfile?._id 
                        ? `/profile/${packageData.creatorProfile._id}` 
                        : `/profile/user/${packageData.creator?._id}`}
                      className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Detail Creator
                    </Link>
                  )}

                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Detail Paket
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Soal</span>
                        <span className="font-medium">{totalQuestions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durasi</span>
                        <span className="font-medium">
                          {formatDuration(packageData.duration)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kategori</span>
                        <span className="font-medium">
                          {packageData.category?.name || packageData.categoryName || "Tidak dikategorikan"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Harga</span>
                        <span className="font-medium">
                          {formatPrice(packageData.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Info */}
                <div className="bg-gray-100 rounded-xl p-4 mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Kategori</h4>
                  <p className="text-sm text-gray-600">
                    {packageData.category?.name || packageData.categoryName || "Tidak ada kategori"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

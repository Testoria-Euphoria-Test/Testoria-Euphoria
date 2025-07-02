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
  const [packageData, setPackageData] = useState<PackageWithDetails | null>(
    null
  );
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
        const authResponse = await fetch("/api/auth/check", {
          method: "GET",
          credentials: "include",
        });

        setIsLoggedIn(authResponse.ok);

        // Fetch package data
        const uri = `/api/packages/${id}?withDetails=true`;
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
    <div className="bg-white">
      <Navbar showUserActions={isLoggedIn} />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-white">
            <Link
              href={isLoggedIn ? "/dashboard-customer" : "/"}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {isLoggedIn ? "Kembali ke Dashboard" : "Kembali ke Beranda"}
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white text-black py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2">
                <div className="mb-4">
                  {(packageData.category?.name || packageData.categoryName) && (
                    <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                      <Tag className="w-4 h-4 mr-2" />
                      {packageData.category?.name || packageData.categoryName}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  {packageData.title}
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {packageData.description}
                </p>

                {/* Package Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="font-semibold text-gray-700">
                        Total Soal
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {totalQuestions}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="font-semibold text-gray-700">
                        Durasi
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatDuration(packageData.duration)}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Award className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="font-semibold text-gray-700">
                        Rating
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {packageData.averageRating
                        ? `${packageData.averageRating.toFixed(1)}/5.0`
                        : "Belum ada"}
                    </div>
                  </div>
                </div>
                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - Creator Profile */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                        <User className="w-5 h-5 mr-2 text-gray-500" />
                        Profil Creator
                      </h2>

                      <div className="flex flex-col items-center text-center">
                        {/* Creator Avatar */}
                        <div className="w-20 h-20 mb-4 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {packageData.creatorProfile?.photoUrl ? (
                            <img
                              src={packageData.creatorProfile.photoUrl}
                              alt="Creator"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-10 h-10 text-gray-400" />
                          )}
                        </div>

                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {packageData.creator?.name || packageData.creatorName}
                        </h3>

                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-3">
                          {packageData.creator?.role || "creator"}
                        </span>

                        {packageData.creator?.email && (
                          <div className="flex items-center text-gray-500 text-sm">
                            <Mail className="w-4 h-4 mr-2" />
                            {packageData.creator.email}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Ratings & Reviews */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-yellow-500" />
                        Rating & Ulasan
                      </h2>

                      {/* Rating Overview */}
                      <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-yellow-500 mb-2">
                          {packageData.averageRating
                            ? packageData.averageRating.toFixed(1)
                            : "0.0"}
                        </div>
                        <div className="flex justify-center mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-lg ${
                                star <= (packageData.averageRating || 0)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">dari 5.0</p>
                      </div>

                      {/* Individual Ratings or Empty State */}
                      {packageData.ratings && packageData.ratings.length > 0 ? (
                        <div className="space-y-3">
                          {packageData.ratings.map(
                            (rating: number, index: number) => (
                              <div
                                key={index}
                                className="border border-gray-100 rounded-lg bg-gray-50 px-4 py-3 flex items-center gap-3"
                              >
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-gray-900 mb-1">
                                    Pengguna {index + 1}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                          key={star}
                                          className={`text-sm ${
                                            star <= rating
                                              ? "text-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-600">
                                      {rating}/5
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <h3 className="text-base font-medium text-gray-600 mb-1">
                            Belum Ada Ulasan...
                          </h3>
                        </div>
                      )}
                    </div>
                  </div>
                  <Toaster position="top-right" />
                </div>
              </div>

              {/* Quick Action Card */}
              <div>
                {/* Package Cover Image - Moved above Quick Action Card */}
                {packageData.images && (
                  <div
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6"
                    style={{ height: 500 }}
                  >
                    <div className="aspect-video rounded-lg overflow-hidden w-full h-full flex items-center justify-center">
                      <img
                        src={
                          Array.isArray(packageData.images)
                            ? packageData.images[0]
                            : packageData.images
                        }
                        alt="Cover Paket"
                        className="w-full h-full object-cover"
                        style={{
                          maxHeight: "100%",
                          maxWidth: "100%",
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
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
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center mb-4 shadow-lg"
                  >
                    {packageData.price === 0
                      ? "Mulai Gratis"
                      : "Beli Paket"}
                  </button>

                  {(packageData.creatorProfile?._id ||
                    packageData.creator?._id) && (
                    <Link
                      href={
                        packageData.creatorProfile?._id
                          ? `/profile/${packageData.creatorProfile._id}`
                          : `/profile/user/${packageData.creator?._id}`
                      }
                      className="w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Detail Creator
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
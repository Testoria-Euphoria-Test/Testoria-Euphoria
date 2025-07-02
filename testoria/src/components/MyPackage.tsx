"use client";

import { useState, useEffect } from "react";
import { Package, Clock } from "lucide-react";

// ✅ Update interface sesuai struktur data dari API
interface PaymentWithPackage {
  _id: string;
  amount: number;
  createdAt: string;
  midtransOrderId: string;
  status: string;
  package: {
    _id: string;
    title: string;
    description: string;
    duration: number;
    price: number;
    categoryId: string;
    creatorId: string;
    contents: unknown[];
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    pdfImages: string[];
    sourcePdf: string[];
  };
}

export default function MyPackage() {
  const [myPackages, setMyPackages] = useState<PaymentWithPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyPackages();
  }, []);

  const fetchMyPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Fetch payments dengan filter status paid (yang sudah include package data)
      const response = await fetch("/api/payments?status=paid", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Gagal memuat paket Anda");
      }

      const payments = await response.json();
      console.log("Fetched payment data with packages:", payments);

      // ✅ Filter hanya payment yang punya package data
      const validPayments = payments.filter(
        (payment: PaymentWithPackage) => payment.package && payment.package._id
      );

      setMyPackages(validPayments);
    } catch (err) {
      console.error("Error fetching my packages:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const safeNumber = (value: unknown, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  };

  const handleStartTryout = (packageId: string) => {
    // Navigate to tryout page
    window.location.href = `/packages/${packageId}/tryout`;
  };

  const handleViewDetail = (packageId: string) => {
    // Navigate to package detail
    window.location.href = `/packages/${packageId}`;
  };

  // ✅ Get category name from categoryId (you might want to create a mapping)
  const getCategoryName = (categoryId: string): string => {
    const categoryMap: { [key: string]: string } = {
      "685baa14dc36f1fa426c982f": "TOEFL",
      // Add more category mappings as needed
    };
    return categoryMap[categoryId] || "Kategori Tidak Diketahui";
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        {/* Simple Loading Animation */}
        <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-6">
          <Package className="w-8 h-8 text-white" />
        </div>

        {/* Loading Spinner */}
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-6"></div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Memuat Paket Anda
        </h3>
        <p className="text-gray-600">Sedang mengambil data paket tryout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-6">
          <Package className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Gagal Memuat Paket
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
          {error}
        </p>

        <div className="space-y-3">
          <button
            onClick={fetchMyPackages}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
          >
            Coba Lagi
          </button>
          <div>
            <button
              onClick={() => (window.location.href = "/dashboard-customer")}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (myPackages.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
          <Package className="w-8 h-8 text-gray-400" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Belum Ada Paket
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
          Anda belum membeli paket apapun. Jelajahi paket yang tersedia untuk
          memulai persiapan tes Anda.
        </p>

        <button
          onClick={() => (window.location.href = "/dashboard-customer")}
          className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
        >
          Jelajahi Paket
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Koleksi Paket Anda
            </h3>
            <p className="text-gray-600">
              Akses dan kelola semua paket tryout yang dimiliki
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-4 py-2 rounded-full border border-emerald-200">
          <span className="font-semibold">{myPackages.length}</span>
          <span className="ml-1 text-sm">Paket</span>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {myPackages.map((paymentItem, index) => {
          const packageData = paymentItem.package;

          return (
            <div
              key={paymentItem._id}
              className="group bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 animate-slideInUp opacity-0"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: "forwards",
              }}
            >
              {/* Package Header */}
              <div className="relative p-6 border-b border-gray-100/50">
                {/* Premium Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center space-x-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    <span>PREMIUM</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300 pr-20">
                    {packageData.title || "Paket Tanpa Judul"}
                  </h4>

                  {/* Meta Information */}
                  <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
                      <Package className="w-4 h-4 mr-1.5 text-emerald-600" />
                      <span className="font-medium">
                        {getCategoryName(packageData.categoryId)}
                      </span>
                    </div>
                    <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
                      <Clock className="w-4 h-4 mr-1.5 text-blue-600" />
                      <span className="font-medium">
                        {safeNumber(packageData.duration)} menit
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description - preserving WYSIWYG formatting */}
                <div 
                  className="text-gray-600 text-sm line-clamp-3 leading-relaxed prose prose-sm max-w-none prose-p:text-gray-600 prose-p:text-sm prose-p:leading-relaxed prose-p:m-0 prose-strong:text-gray-700 prose-em:text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html: packageData.description || "Tidak ada deskripsi tersedia untuk paket ini."
                  }}
                />
              </div>

              {/* Action Section */}
              <div className="p-6 bg-gradient-to-b from-white to-gray-50/50">
                <div className="space-y-3">
                  {/* Primary Action */}
                  <button
                    onClick={() => handleStartTryout(packageData._id)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <span>🚀</span>
                    <span>Mulai Tryout</span>
                  </button>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleViewDetail(packageData._id)}
                      className="group flex items-center justify-center space-x-2 py-2.5 px-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium"
                    >
                      <span className="group-hover:scale-110 transition-transform">
                        👁️
                      </span>
                      <span>Detail</span>
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = `/packages/${packageData._id}/results`)
                      }
                      className="group flex items-center justify-center space-x-2 py-2.5 px-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium"
                    >
                      <span className="group-hover:scale-110 transition-transform">
                        📊
                      </span>
                      <span>Hasil</span>
                    </button>
                  </div>
                </div>

                {/* Package Stats */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Dibeli:{" "}
                      {new Date(paymentItem.createdAt).toLocaleDateString(
                        "id-ID"
                      )}
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span>Aktif</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

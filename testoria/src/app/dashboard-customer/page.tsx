"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Search,
  BookOpen,
  CreditCard,
  FileText,
  Filter,
  BookDashedIcon,
} from "lucide-react";
import PackageCard from "@/components/PackageCard";
import Navbar from "@/components/Navbar";
import { PackageResponse } from "@/types/package";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
}

// Extended package type for dashboard display
interface DashboardPackage extends PackageResponse {
  categoryName?: string;
  creatorName?: string;
}

export default function DashboardCustomerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  // State untuk data dari API
  const [packages, setPackages] = useState<DashboardPackage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch packages dari API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/packages?published=true", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch packages");
        }

        const data = await response.json();

        if (data.success) {
          console.log("Setting packages:", data.data?.length, "packages");
          setPackages(data.data);
        } else {
          throw new Error(data.message || "Failed to load packages");
        }
      } catch (err) {
        console.error("Error fetching packages:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const fallbackCategories = [
        { _id: "all", name: "Semua Kategori" },
        { _id: "685baa87dc36f1fa426c9831", name: "CPNS" },
        { _id: "685f64151ead9f4f152b2197", name: "SKD Kedinasan" },
        { _id: "685f6fcc1ead9f4f152b2198", name: "SNBT" },
        { _id: "685baa14dc36f1fa426c982f", name: "TOEFL" },
      ];

      try {
        const response = await fetch("/api/categories", {
          credentials: "include",
        });

        const data = await response.json();
        console.log("Categories response:", data);

        // ✅ Safe extraction with multiple fallbacks
        let categories = [];

        if (data?.success && Array.isArray(data?.data)) {
          categories = data.data;
        } else if (Array.isArray(data?.data)) {
          categories = data.data;
        } else if (Array.isArray(data)) {
          categories = data;
        }

        // ✅ Validate and filter valid categories
        const validCategories = categories
          .filter(Boolean) // Remove null/undefined
          .filter((cat: unknown): cat is Category => {
            const category = cat as Partial<Category>;
            return Boolean(category._id && category.name);
          }) // Must have _id and name
          .map((cat: Category) => ({
            _id: String(cat._id),
            name: String(cat.name),
          })); // Ensure strings

        if (validCategories.length > 0) {
          setCategories([
            { _id: "all", name: "Semua Kategori" },
            ...validCategories,
          ]);
        } else {
          throw new Error("Tidak ada kategori yang valid");
        }
      } catch (error) {
        console.log("Menggunakan fallback kategori karena:", error);
        setCategories(fallbackCategories);
      }
    };

    fetchCategories();
  }, []);

  // ✅ Improved filtering logic - API sudah memfilter published packages
  const filteredPackages = packages.filter((pkg) => {
    console.log("Filtering package:", {
      title: pkg.title,
      categoryId: pkg.categoryId,
      selectedCategory,
    });

    const matchesSearch =
      pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.creatorName &&
        pkg.creatorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = (() => {
      // If "all" is selected, show all packages
      if (selectedCategory === "all") {
        return true;
      }

      // Check if package categoryId matches selected category
      if (pkg.categoryId === selectedCategory) {
        return true;
      }

      // Fallback: check if categoryName matches (case insensitive)
      if (pkg.categoryName) {
        const selectedCategoryName = categories
          .find((c) => c._id === selectedCategory)
          ?.name?.toLowerCase();

        if (
          selectedCategoryName &&
          pkg.categoryName.toLowerCase().includes(selectedCategoryName)
        ) {
          return true;
        }
      }

      return false;
    })();

    console.log("Filter results:", {
      title: pkg.title,
      matchesSearch,
      matchesCategory,
      final: matchesSearch && matchesCategory,
    });

    return matchesSearch && matchesCategory;
  });

  const sortedPackages = [...filteredPackages].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "title":
        return a.title.localeCompare(b.title);
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      default:
        return 0;
    }
  });

  // ✅ Helper function to get category name for display
  const getSelectedCategoryName = () => {
    if (selectedCategory === "all") return null;
    return categories.find((c) => c._id === selectedCategory)?.name;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7fafd]">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            {/* Simple Loading Icon */}
            <div className="w-16 h-16 bg-[#1e3a8a] rounded-lg flex items-center justify-center mx-auto mb-8 shadow-sm">
              <Package className="w-8 h-8 text-white" />
            </div>
            {/* Loading Spinner */}
            <div className="w-8 h-8 border-2 border-[#e0e7ef] border-t-[#1e3a8a] rounded-full animate-spin mx-auto mb-6"></div>
            {/* Loading Text */}
            <h2 className="text-xl font-semibold text-[#1e3a8a] mb-2">
              Memuat Dashboard
            </h2>
            <p className="text-[#64748b]">Sedang menyiapkan paket tryout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7fafd]">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-[#1e3a8a] rounded-lg flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[#1e3a8a] mb-3">
              Terjadi Kesalahan
            </h2>
            <p className="text-[#64748b] mb-8 leading-relaxed">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-[#1e3a8a] text-white rounded-lg hover:bg-[#223e96] transition-colors duration-200 font-medium"
              >
                Muat Ulang Halaman
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full px-6 py-3 bg-[#e0e7ef] hover:bg-[#c7d2fe] text-[#1e3a8a] rounded-lg transition-colors duration-200 font-medium"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fafd]">
      <Navbar />


      {/* Navigation Cards Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-16 relative z-10 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard-customer"
            className="group bg-white rounded-lg shadow-sm border-2 border-[#1e3a8a] p-6 text-center hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 bg-[#1e3a8a] rounded-lg flex items-center justify-center mx-auto mb-3">
              <BookDashedIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-[#1e3a8a] mb-1">Dashboard</h3>
            <p className="text-[#64748b] text-sm">Beranda Utama</p>
          </Link>

          <Link
            href="/my-package"
            className="group bg-white rounded-lg shadow-sm border border-[#e0e7ef] p-6 text-center hover:shadow-md hover:border-[#b6c3e6] transition-all duration-200"
          >
            <div className="w-12 h-12 bg-[#e0e7ef] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-[#c7d2fe] transition-colors">
              <BookOpen className="w-6 h-6 text-[#1e3a8a]" />
            </div>
            <h3 className="font-semibold text-[#1e3a8a] mb-1">My Paket</h3>
            <p className="text-[#64748b] text-sm">Paket Saya</p>
          </Link>

          <Link
            href="/payment-history"
            className="group bg-white rounded-lg shadow-sm border border-[#e0e7ef] p-6 text-center hover:shadow-md hover:border-[#b6c3e6] transition-all duration-200"
          >
            <div className="w-12 h-12 bg-[#e0e7ef] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-[#c7d2fe] transition-colors">
              <CreditCard className="w-6 h-6 text-[#1e3a8a]" />
            </div>
            <h3 className="font-semibold text-[#1e3a8a] mb-1">Pembayaran</h3>
            <p className="text-[#64748b] text-sm">Riwayat Transaksi</p>
          </Link>

          <Link
            href="/tryout-history"
            className="group bg-white rounded-lg shadow-sm border border-[#e0e7ef] p-6 text-center hover:shadow-md hover:border-[#b6c3e6] transition-all duration-200"
          >
            <div className="w-12 h-12 bg-[#e0e7ef] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-[#c7d2fe] transition-colors">
              <FileText className="w-6 h-6 text-[#1e3a8a]" />
            </div>
            <h3 className="font-semibold text-[#1e3a8a] mb-1">Tryout</h3>
            <p className="text-[#64748b] text-sm">Riwayat Ujian</p>
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-lg border border-[#e0e7ef] p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1e3a8a] mb-2">
                Jelajahi Paket
              </h2>
              <p className="text-[#64748b]">
                Temukan paket tryout yang sesuai dengan kebutuhan Anda
              </p>
            </div>
            <div className="hidden lg:flex items-center space-x-2 text-sm text-[#64748b] bg-[#f7fafd] px-3 py-2 rounded-lg">
              <Package className="w-4 h-4" />
              <span className="font-medium">{packages.length} total paket</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Search */}
            <div className="lg:col-span-5">
              <label className="block text-sm font-medium text-[#1e3a8a] mb-3">
                Cari Paket
              </label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#b6c3e6]" />
                <input
                  type="text"
                  placeholder="Masukkan kata kunci..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[#e0e7ef] rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-all duration-200 bg-white text-[#1e3a8a] placeholder:text-[#b6c3e6]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#e0e7ef] hover:bg-[#c7d2fe] rounded-full flex items-center justify-center text-[#64748b] hover:text-[#1e3a8a] transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-[#1e3a8a] mb-3">
                Kategori
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-[#e0e7ef] rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-all duration-200 bg-white appearance-none cursor-pointer text-[#1e3a8a]"
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Filter className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#b6c3e6] pointer-events-none" />
              </div>
            </div>

            {/* Sort */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-[#1e3a8a] mb-3">
                Urutkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-[#e0e7ef] rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-all duration-200 bg-white text-[#1e3a8a]"
              >
                <option value="popular">Terpopuler</option>
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="title">Nama A-Z</option>
                <option value="price-low">Harga: Rendah ke Tinggi</option>
                <option value="price-high">Harga: Tinggi ke Rendah</option>
              </select>
            </div>
          </div>

          {/* Active filters display */}
          {(searchTerm || selectedCategory !== "all") && (
            <div className="mt-8 pt-6 border-t border-[#e0e7ef]">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-[#1e3a8a]">
                  Filter aktif:
                </span>
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-[#e0e7ef] text-[#1e3a8a] border border-[#b6c3e6]">
                    Pencarian: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-2 w-4 h-4 bg-[#b6c3e6] hover:bg-[#1e3a8a] rounded-full flex items-center justify-center text-white hover:text-white transition-colors text-xs font-bold"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-[#e0e7ef] text-[#1e3a8a] border border-[#b6c3e6]">
                    Kategori: {getSelectedCategoryName()}
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="ml-2 w-4 h-4 bg-[#b6c3e6] hover:bg-[#1e3a8a] rounded-full flex items-center justify-center text-white hover:text-white transition-colors text-xs font-bold"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Summary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between bg-white rounded-lg p-6 border border-[#e0e7ef]">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#1e3a8a] rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#64748b]">Total paket ditemukan</p>
              <p className="text-2xl font-bold text-[#1e3a8a]">
                {sortedPackages.length}
                {selectedCategory !== "all" && (
                  <span className="text-lg font-medium text-[#64748b] ml-2">
                    dalam {getSelectedCategoryName()}
                  </span>
                )}
              </p>
            </div>
          </div>

          {(searchTerm || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchTerm("");
              }}
              className="px-4 py-2 bg-[#e0e7ef] hover:bg-[#c7d2fe] text-[#1e3a8a] rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              Reset Filter
            </button>
          )}
        </div>
      </section>

      {/* Packages Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {sortedPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {sortedPackages.map((pkg, index) => {
              console.log(
                "Rendering package:",
                pkg.title,
                "isPublished:",
                pkg.isPublished
              );
              return (
                <div
                  key={pkg._id}
                  className="animate-slideInUp opacity-0"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: "forwards",
                  }}
                >
                  <PackageCard package={pkg} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[#e0e7ef] rounded-lg flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-[#b6c3e6]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1e3a8a] mb-4">
              {searchTerm || selectedCategory !== "all"
                ? "Tidak ada paket ditemukan"
                : "Belum ada paket tersedia"}
            </h3>
            <p className="text-[#64748b] max-w-md mx-auto mb-8 leading-relaxed">
              {searchTerm || selectedCategory !== "all"
                ? "Coba sesuaikan pencarian atau filter Anda untuk menemukan apa yang Anda cari."
                : "Saat ini belum ada paket yang tersedia. Silakan periksa kembali nanti."}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchTerm("");
                }}
                className="px-8 py-3 bg-[#1e3a8a] text-white rounded-lg hover:bg-[#223e96] transition-colors duration-200 font-medium"
              >
                Hapus Semua Filter
              </button>
            )}
          </div>
        )}
      </section>
      {/* Enhanced animations and styles */}
      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideInUp {
          animation: slideInUp 0.4s ease-out;
        }
        /* Remove all gradients and primary colors except blue */
        body {
          background: #f7fafd !important;
        }
      `}</style>
    </div>
  );
}


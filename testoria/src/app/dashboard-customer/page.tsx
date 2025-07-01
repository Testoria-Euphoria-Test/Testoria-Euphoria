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

        const response = await fetch("/api/packages", {
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
          setPackages(data.data || []);
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
          .filter((cat: any) => cat._id && cat.name) // Must have _id and name
          .map((cat: any) => ({
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

  const navigationItems = [
    {
      id: "browse",
      label: "Telusuri Paket",
      icon: Package,
      type: "tab",
    },
    {
      id: "my-packages",
      label: "Paket Saya",
      icon: BookOpen,
      type: "button",
      href: "/my-package",
    },
    {
      id: "payment-history",
      label: "Riwayat Pembayaran",
      icon: CreditCard,
      type: "button",
      href: "/payment-history",
    },
    {
      id: "tryout-history",
      label: "Riwayat Tryout",
      icon: FileText,
      type: "button",
      href: "/tryout-history",
    },
  ];

  // ✅ Improved filtering logic - include isPublished filter
  const filteredPackages = packages.filter((pkg) => {
    // First check if package is published
    if (!pkg.isPublished) {
      return false;
    }

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
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-indigo-200">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-blue-700 font-semibold text-lg tracking-wide">
              Memuat paket...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-white to-orange-100">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center border border-red-200">
            <Package className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Terjadi Kesalahan
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-400 text-white rounded-xl hover:from-red-600 hover:to-orange-500 transition-all duration-300 shadow"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Navigation Section */}
      <div className="flex justify-center gap-4 mb-8 mt-4 bg-white">
        <Link
          href="/dashboard-customer"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium shadow-sm"
        >
          <BookDashedIcon className="w-5 h-5 mr-2" />
          Dashboard
        </Link>
        <Link
          href="/my-package"
          className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium border border-gray-200 shadow-sm"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          My-Paket
        </Link>
        <Link
          href="/payment-history"
          className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium border border-gray-200 shadow-sm"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Riwayat Pembayaran
        </Link>
        <Link
          href="/tryout-history"
          className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium border border-gray-200 shadow-sm"
        >
          <FileText className="w-5 h-5 mr-2" />
          Riwayat Tryout
        </Link>
      </div>

      {/* Filters Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 ">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 " />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-gray-600 pl-12 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200  "
              />
            </div>
            {/* Category Filter */}
            <div className="relative min-w-[200px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-gray-400 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none cursor-pointer pr-10"
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Filter className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none " />
            </div>
            {/* Sort */}
            <div className="min-w-[180px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-gray-400 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">Title A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active filters display */}
          {(searchTerm || selectedCategory !== "all") && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-2 hover:text-blue-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Category: {getSelectedCategoryName()}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="ml-2 hover:text-green-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Results Summary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {sortedPackages.length}
            </span>{" "}
            packages
            {selectedCategory !== "all" && (
              <span>
                {" "}
                in{" "}
                <span className="font-semibold">
                  {getSelectedCategoryName()}
                </span>
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {sortedPackages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {sortedPackages.map((packageItem, index) => (
              <div
                key={packageItem._id}
                className="animate-fadeInUp opacity-0 transition-all duration-500 ease-out transform translate-y-10 h-full"
                style={{
                  animationDelay: `${index * 0.15}s`,
                  animationFillMode: "forwards",
                }}
              >
                <PackageCard package={packageItem} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm || selectedCategory !== "all"
                ? "No packages found"
                : "No packages available"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters to find what you're looking for."
                : "There are no packages available at the moment. Please check back later."}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedCategory("all");
                  setSearchTerm("");
                }}assName="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium"
              > Clear All Filters
                Clear All Filters
              </button>
            )}v>
          </div>
        )}ction>
      </section>
      {/* Enhanced animations */}
      {/* Enhanced animations */}
      <style jsx>{`fadeInUp {
        @keyframes fadeInUp {
          from {ity: 0;
            opacity: 0;translateY(30px) scale(0.95);
            transform: translateY(30px) scale(0.95);
          }o {
          to {acity: 1;
            opacity: 1;translateY(0) scale(1);
            transform: translateY(0) scale(1);
          }
        }animate-fadeInUp {
        .animate-fadeInUp {Up 0.8s cubic-bezier(0.23, 1, 0.32, 1);
          animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }/style>
      `}</style>
    </div>
  );
}

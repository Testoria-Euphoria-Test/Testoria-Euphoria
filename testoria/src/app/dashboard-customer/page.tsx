"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Search,
  BookOpen,
  Grid3X3,
  List,
  CreditCard,
  FileText,
  ExternalLink,
} from "lucide-react";
import PackageCard from "@/components/PackageCard";
import Navbar from "@/components/Navbar";
import PackageResponse from "@/types/PackageResponse";

interface Category {
  _id: string;
  name: string;
}

export default function DashboardCustomerPage() {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("popular");

  // State untuk data dari API
  const [packages, setPackages] = useState<PackageResponse[]>([]);
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
          .filter((cat) => cat._id && cat.name) // Must have _id and name
          .map((cat) => ({ _id: String(cat._id), name: String(cat.name) })); // Ensure strings

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

  // ✅ Improved category filtering logic
  const filteredPackages = packages.filter((pkg) => {
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

  const handleNavigation = (item: (typeof navigationItems)[0]) => {
    if (item.type === "tab") {
      setActiveTab(item.id);
    } else if (item.type === "button" && item.href) {
      window.location.href = item.href;
    }
  };

  // ✅ Helper function to get category name for display
  const getSelectedCategoryName = () => {
    if (selectedCategory === "all") return null;
    return categories.find((c) => c._id === selectedCategory)?.name;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat paket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-2">Terjadi Kesalahan</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Main Content Area */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* ✅ Updated Navigation - Mix of tabs and buttons */}
            <div className="border-b border-gray-100 bg-gray-50/50">
              <nav className="flex space-x-0 overflow-x-auto px-6">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id && item.type === "tab";

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item)}
                      className={`py-4 px-6 border-b-3 font-semibold text-sm flex items-center whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? "border-blue-600 text-blue-600 bg-white rounded-t-xl -mb-px"
                          : item.type === "button"
                          ? "border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-t-xl"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-t-xl"
                      }`}
                    >
                      <IconComponent className="w-5 h-5 mr-2" />
                      {item.label}
                      {item.type === "button" && (
                        <ExternalLink className="w-4 h-4 ml-2 opacity-60" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* ✅ Only show filters for browse tab */}
            {activeTab === "browse" && (
              <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari paket..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3 w-full sm:w-80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white text-gray-600"
                      />
                    </div>

                    {/* ✅ Improved Category Filter */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium min-w-[200px] text-gray-400"
                    >
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium text-gray-400"
                    >
                      <option value="popular">Paling Populer</option>
                      <option value="newest">Terbaru</option>
                      <option value="oldest">Terlama</option>
                      <option value="title">Judul A-Z</option>
                      <option value="price-low">Harga: Termurah</option>
                      <option value="price-high">Harga: Termahal</option>
                    </select>

                    {/* View Mode */}
                    <div className="flex border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-3 transition-all duration-200 ${
                          viewMode === "grid"
                            ? "bg-blue-50 text-blue-600 border-r border-blue-200"
                            : "text-gray-500 hover:bg-gray-50 border-r border-gray-200"
                        }`}
                      >
                        <Grid3X3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-3 transition-all duration-200 ${
                          viewMode === "list"
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ Content - Only Browse Packages */}
            <div className="p-6">
              {/* Browse Packages Content */}
              {activeTab === "browse" && (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {sortedPackages.length > 0 ? (
                    sortedPackages.map((packageItem) => (
                      <PackageCard
                        key={packageItem._id}
                        package={{
                          _id: packageItem._id,
                          title: packageItem.title,
                          description: packageItem.description,
                          duration: packageItem.duration,
                          price: packageItem.price,
                          categoryId: packageItem.categoryId,
                          creatorId: packageItem.creatorId,
                          sourcePdf: packageItem.sourcePdf,
                          pdfImages: packageItem.pdfImages,
                          contents: packageItem.contents,
                          isPublished: packageItem.isPublished,
                          createdAt: packageItem.createdAt,
                          updatedAt: packageItem.updatedAt,
                          categoryName: packageItem.categoryName,
                          creatorName: packageItem.creatorName,
                        }}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {searchTerm || selectedCategory !== "all"
                          ? "Paket tidak ditemukan"
                          : "Belum ada paket"}
                      </h3>
                      <p className="text-gray-600 text-lg max-w-md mx-auto mb-4">
                        {searchTerm || selectedCategory !== "all"
                          ? "Coba ubah kata kunci pencarian atau filter untuk menemukan paket yang sesuai."
                          : "Belum ada paket yang tersedia saat ini. Silakan cek kembali nanti."}
                      </p>
                      {(searchTerm || selectedCategory !== "all") && (
                        <button
                          onClick={() => {
                            setSelectedCategory("all");
                            setSearchTerm("");
                          }}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Hapus Filter
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

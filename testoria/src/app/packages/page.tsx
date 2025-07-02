"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Grid3X3, List, SlidersHorizontal } from "lucide-react";
import PackageCard from "@/components/PackageCard";
import { PackageResponse } from "@/types/package";
import Navbar from "@/components/Navbar";

interface Category {
  _id: string;
  name: string;
}

export default function PackagePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<PackageResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { _id: "all", name: "Semua Kategori" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch packages and categories in parallel
        const [packagesResponse, categoriesResponse] = await Promise.all([
          fetch("/api/packages?published=true&withDetails=true", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }),
          fetch("/api/categories", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }),
        ]);

        // Handle packages response
        if (!packagesResponse.ok) {
          throw new Error("Failed to fetch packages");
        }
        const packagesData = await packagesResponse.json();
        if (packagesData.success) {
          setPackages(packagesData.data || []);
        } else {
          throw new Error(packagesData.message || "Failed to load packages");
        }

        // Handle categories response
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          if (categoriesData.success && categoriesData.data) {
            console.log("📋 Categories loaded:", categoriesData.data);
            setCategories([
              { _id: "all", name: "Semua Kategori" },
              ...categoriesData.data,
            ]);
          } else {
            console.warn("Categories API returned no data");
          }
        } else {
          console.warn(
            "Failed to fetch categories:",
            categoriesResponse.status
          );
          // Keep default categories if API fails
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort packages
  const filteredAndSortedPackages = useMemo(() => {
    console.log("🔍 Filtering packages with search term:", searchTerm);
    console.log("📦 Total packages:", packages.length);

    const filtered = packages.filter((pkg) => {
      const searchTermLower = searchTerm.toLowerCase().trim();

      // Skip filtering if no search term
      if (!searchTermLower) {
        const matchesCategory =
          selectedCategory === "all" ||
          pkg.categoryId === selectedCategory ||
          (pkg.categoryName &&
            pkg.categoryName
              .toLowerCase()
              .includes(selectedCategory.toLowerCase()));
        const matchesLevel = selectedLevel === "all";
        return matchesCategory && matchesLevel;
      }

      const matchesSearch =
        pkg.title.toLowerCase().includes(searchTermLower) ||
        (pkg.description &&
          pkg.description.toLowerCase().includes(searchTermLower)) ||
        (pkg.creatorName &&
          pkg.creatorName.toLowerCase().includes(searchTermLower)) ||
        (pkg.categoryName &&
          pkg.categoryName.toLowerCase().includes(searchTermLower));

      const matchesCategory =
        selectedCategory === "all" ||
        pkg.categoryId === selectedCategory ||
        (pkg.categoryName &&
          pkg.categoryName
            .toLowerCase()
            .includes(selectedCategory.toLowerCase()));

      // Level filter (currently not implemented in data structure)
      const matchesLevel = selectedLevel === "all";

      const result = matchesSearch && matchesCategory && matchesLevel;

      if (searchTermLower && result) {
        console.log(
          "✅ Package matched:",
          pkg.title,
          "by creator:",
          pkg.creatorName
        );
      }

      return result;
    });

    console.log("🎯 Filtered packages count:", filtered.length);

    // Sort packages
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "title":
          return a.title.localeCompare(b.title);
        case "duration":
          return a.duration - b.duration;
        default: // popular
          return 0;
      }
    });

    return sorted;
  }, [searchTerm, selectedCategory, selectedLevel, sortBy, packages]);

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md ">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari paket, creator, kategori, atau topik..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 shadow-sm "
                />
              </div>

              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Filter
              </button>

              {/* Desktop Filters */}
              <div
                className={`flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 ${
                  showFilters ? "block" : "hidden lg:flex"
                }`}
              >
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={loading}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <option value="all">Memuat kategori...</option>
                  ) : (
                    categories.map((category: Category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white text-gray-400"
                >
                  <option value="popular">Paling Populer</option>
                  <option value="title">Judul A-Z</option>
                  <option value="price-low">Harga: Termurah</option>
                  <option value="price-high">Harga: Termahal</option>
                  <option value="duration">Durasi</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-3 transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-3 transition-all duration-200 border-l border-gray-200 ${
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

          {/* Search Results Summary */}
          {!loading && !error && packages.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {searchTerm ? (
                    <span>
                      Menampilkan{" "}
                      <strong>{filteredAndSortedPackages.length}</strong> dari{" "}
                      <strong>{packages.length}</strong> paket untuk pencarian{" "}
                      <em>&ldquo;{searchTerm}&rdquo;</em>
                    </span>
                  ) : (
                    <span>
                      Menampilkan{" "}
                      <strong>{filteredAndSortedPackages.length}</strong> paket
                      tersedia
                    </span>
                  )}
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Hapus pencarian
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Package Grid/List */}
          {loading ? (
            /* Loading State */
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Memuat paket...
              </h3>
              <p className="text-gray-600">Mohon tunggu sebentar</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Filter className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Gagal memuat paket
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredAndSortedPackages.length > 0 ? (
            <div className="grid grid-cols-3 gap-6">
              {filteredAndSortedPackages.map((pkg) => (
                <PackageCard key={pkg._id} package={pkg} />
              ))}
            </div>
          ) : packages.length === 0 ? (
            /* No Packages Available */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Filter className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Belum ada paket tersedia
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                Saat ini belum ada paket tryout yang tersedia. Silakan cek
                kembali nanti.
              </p>
            </div>
          ) : (
            /* Filtered Results Empty */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Filter className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Paket tidak ditemukan
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                Tidak ada paket yang sesuai dengan pencarian &ldquo;{searchTerm}
                &rdquo; atau filter yang dipilih.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedLevel("all");
                  setSortBy("popular");
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Hapus Filter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

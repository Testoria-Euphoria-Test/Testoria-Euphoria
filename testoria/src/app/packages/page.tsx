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

// Mock data
const mockCategories: Category[] = [
  { _id: "all", name: "Semua Kategori" },
  { _id: "cat1", name: "UTBK" },
  { _id: "cat2", name: "CPNS" },
  { _id: "cat3", name: "SNBT" },
  { _id: "cat4", name: "Kedinasan" },
  { _id: "cat5", name: "Olimpiade" },
];

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

  // Filter and sort packages
  const filteredAndSortedPackages = useMemo(() => {
    let filtered = packages.filter((pkg) => {
      const matchesSearch =
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.creatorId &&
          pkg.creatorId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || pkg.categoryId === selectedCategory;

      // Level filter (dummy, since level not in data)
      const matchesLevel =
        selectedLevel === "all" || (pkg.level && pkg.level === selectedLevel);

      return matchesSearch && matchesCategory && matchesLevel;
    });

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
                  placeholder="Cari paket, pembuat, atau topik..."
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
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white text-gray-400"
                >
                  {mockCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
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

          {/* Package Grid/List */}
          {filteredAndSortedPackages.length > 0 ? (
            <div
              className="grid grid-cols-3 gap-6"
            >
              {filteredAndSortedPackages.map((pkg) => (
                <PackageCard key={pkg._id} package={pkg} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Filter className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Paket tidak ditemukan
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                Coba ubah kata kunci pencarian atau filter untuk menemukan paket
                yang sesuai.
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

"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Grid3X3, List, SlidersHorizontal } from "lucide-react";
import PackageCard from "@/components/PackageCard";
import type { Package } from "@/components/PackageCard";

interface Category {
  _id: string;
  name: string;
}

// Mock data
const mockCategories: Category[] = [
  { _id: "all", name: "All Categories" },
  { _id: "cat1", name: "UTBK" },
  { _id: "cat2", name: "CPNS" },
  { _id: "cat3", name: "SNBT" },
  { _id: "cat4", name: "Kedinasan" },
  { _id: "cat5", name: "Olimpiade" },
];

const mockPackages: Package[] = [
  {
    _id: "pkg1",
    title: "UTBK Saintek 2024 - Matematika Dasar",
    description:
      "Paket lengkap persiapan UTBK Saintek dengan fokus pada matematika dasar dan penalaran logika. Dilengkapi dengan simulasi ujian yang realistis.",
    duration: 180,
    categoryName: "UTBK",
    creatorName: "Dr. Ahmad Susanto",
    isOwned: false,
    price: 299000,
    level: "Intermediate",
  },
  {
    _id: "pkg2",
    title: "CPNS 2024 - Tes Wawasan Kebangsaan",
    description:
      "Persiapan komprehensif CPNS dengan fokus pada TWK dan materi terbaru sesuai kisi-kisi resmi.",
    duration: 90,
    categoryName: "CPNS",
    creatorName: "Drs. Bambang Wijaya",
    isOwned: true,
    price: 199000,
    level: "Beginner",
  },
  {
    _id: "pkg3",
    title: "SNBT 2024 - Penalaran Matematika",
    description:
      "Simulasi lengkap SNBT dengan format terbaru dan analisis hasil yang mendalam untuk persiapan optimal.",
    duration: 195,
    categoryName: "SNBT",
    creatorName: "Prof. Siti Nurhaliza",
    isOwned: false,
    price: 249000,
    level: "Advanced",
  },
  {
    _id: "pkg4",
    title: "Try Out Kedinasan 2024",
    description:
      "Paket persiapan untuk berbagai sekolah kedinasan dengan prediksi soal yang akurat dan strategi khusus.",
    duration: 120,
    categoryName: "Kedinasan",
    creatorName: "Prof. Siti Nurhaliza",
    isOwned: false,
    price: 179000,
    level: "Intermediate",
  },
  {
    _id: "pkg5",
    title: "Olimpiade Matematika SMA",
    description:
      "Persiapan olimpiade matematika tingkat SMA dengan soal-soal challenging dan pembahasan detail.",
    duration: 240,
    categoryName: "Olimpiade",
    creatorName: "Dr. Ahmad Susanto",
    isOwned: true,
    price: 349000,
    level: "Advanced",
  },
  {
    _id: "pkg6",
    title: "UTBK Soshum 2024 - Ekonomi & Geografi",
    description:
      "Try out UTBK Soshum dengan strategi khusus untuk ekonomi dan geografi, dilengkapi tips dan trik.",
    duration: 180,
    categoryName: "UTBK",
    creatorName: "Dr. Ahmad Susanto",
    isOwned: false,
    price: 279000,
    level: "Intermediate",
  },
  {
    _id: "pkg7",
    title: "CPNS 2024 - Tes Intelegensi Umum",
    description:
      "Latihan intensif TIU dengan berbagai tipe soal dan strategi penyelesaian yang efektif.",
    duration: 100,
    categoryName: "CPNS",
    creatorName: "Drs. Bambang Wijaya",
    isOwned: false,
    price: 189000,
    level: "Beginner",
  },
  {
    _id: "pkg8",
    title: "SNBT 2024 - Literasi Bahasa Indonesia",
    description:
      "Persiapan khusus literasi bahasa Indonesia untuk SNBT dengan metode pembelajaran yang efektif.",
    duration: 150,
    categoryName: "SNBT",
    creatorName: "Prof. Siti Nurhaliza",
    isOwned: false,
    price: 219000,
    level: "Beginner",
  },
];

export default function PackagePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Current user role (in real app, this would come from auth context)
  const userRole = "customer";

  // Filter and sort packages
  const filteredAndSortedPackages = useMemo(() => {
    let filtered = mockPackages.filter((pkg) => {
      const matchesSearch =
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.creatorName &&
          pkg.creatorName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || pkg.categoryName === selectedCategory;

      const matchesLevel =
        selectedLevel === "all" || pkg.level === selectedLevel;

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
  }, [searchTerm, selectedCategory, selectedLevel, sortBy]);

  const handleBuyPackage = (packageId: string) => {
    console.log("Buying package:", packageId);
    // In real app, implement purchase logic
  };

  const handleViewPackage = (packageId: string) => {
    console.log("Viewing package:", packageId);
    // In real app, navigate to package detail
    window.location.href = `/packages/${packageId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search packages, creators, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
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
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
              >
                {mockCategories.map((category) => (
                  <option
                    key={category._id}
                    value={category._id === "all" ? "all" : category.name}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Level Filter */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
              >
                <option value="popular">Most Popular</option>
                <option value="title">Title A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="duration">Duration</option>
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

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600">
              Showing{" "}
              <span className="font-semibold">
                {filteredAndSortedPackages.length}
              </span>{" "}
              of <span className="font-semibold">{mockPackages.length}</span>{" "}
              packages
            </p>
          </div>
        </div>

        {/* Package Grid/List */}
        {filteredAndSortedPackages.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredAndSortedPackages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                package={pkg}
                userRole={userRole as "admin" | "creator" | "customer"}
                onBuy={handleBuyPackage}
                onView={handleViewPackage}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No packages found
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
              Try adjusting your search or filter criteria to find the perfect
              test package.
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
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

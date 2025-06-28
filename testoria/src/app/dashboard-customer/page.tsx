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

  // Static categories untuk sekarang
  useEffect(() => {
    setCategories([
      { _id: "all", name: "All Categories" },
      { _id: "cat1", name: "UTBK" },
      { _id: "cat2", name: "CPNS" },
      { _id: "cat3", name: "SNBT" },
      { _id: "cat4", name: "Kedinasan" },
      { _id: "cat5", name: "Olimpiade" },
    ]);
  }, []);


  const navigationItems = [
    {
      id: "browse",
      label: "Browse Packages",
      icon: Package,
      type: "tab", // Stays as tab
    },
    {
      id: "my-packages",
      label: "My Packages",
      icon: BookOpen,
      type: "button", // Changed to button
      href: "/my-package",
    },
    {
      id: "payment-history",
      label: "Payment History",
      icon: CreditCard,
      type: "button", // Changed to button
      href: "/payment-history",
    },
    {
      id: "tryout-history",
      label: "Tryout History",
      icon: FileText,
      type: "button", // Changed to button
      href: "/tryout-history",
    },
  ];

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.creatorName &&
        pkg.creatorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      pkg.categoryId === selectedCategory ||
      pkg.categoryName
        ?.toLowerCase()
        .includes(
          categories
            .find((c) => c._id === selectedCategory)
            ?.name.toLowerCase() || ""
        );

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

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading packages...</p>
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
            <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
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
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Customer
            </h1>
            <p className="text-gray-600">
              Welcome back! Manage your packages and track your progress.
            </p>
          </div>

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
                        placeholder="Search packages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3 w-full sm:w-80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
                      />
                    </div>

                    {/* Category Filter */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
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
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white font-medium"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="title">Title A-Z</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
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

                {/* Results Summary */}
                <div className="mt-4 text-sm text-gray-600">
                  Showing {sortedPackages.length} of {packages.length} packages
                  {selectedCategory !== "all" && (
                    <span className="ml-1">
                      in{" "}
                      {categories.find((c) => c._id === selectedCategory)?.name}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="ml-1">matching "{searchTerm}"</span>
                  )}
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
                        No packages found
                      </h3>
                      <p className="text-gray-600 text-lg max-w-md mx-auto">
                        Try adjusting your search or filter criteria to find the
                        perfect test package.
                      </p>
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

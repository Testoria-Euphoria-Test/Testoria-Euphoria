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
  User,
} from "lucide-react";
import PackageCard from "@/components/PackageCard";
import Navbar from "@/components/Navbar";

interface Category {
  _id: string;
  name: string;
}

interface Package {
  _id: string;
  title: string;
  categoryId: string;
  creatorId: string;
  duration: number;
  price: number;
  description: string;
  sourcePdf: string[];
  pdfImages: string[];
  contents: any[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  creatorName?: string;
  isOwned?: boolean;
}

interface PaymentHistory {
  _id: string;
  packageId: string;
  packageTitle: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  paymentDate: string;
  paymentMethod: string;
}

interface TryoutHistory {
  _id: string;
  packageId: string;
  packageTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  duration: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "customer" | "creator";
  createdAt: string;
  updatedAt: string;
}

export default function DashboardCustomerPage() {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("popular");

  // State untuk data dari API
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock current user data
  const currentUser: User = {
    _id: "user123",
    name: "John Doe",
    email: "john@example.com",
    role: "customer",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-03-15T10:00:00Z",
  };

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

  // Mock payment history data
  const paymentHistory: PaymentHistory[] = [
    {
      _id: "pay1",
      packageId: "pkg2",
      packageTitle: "CPNS 2024 - Tes Wawasan Kebangsaan",
      amount: 150000,
      status: "completed",
      paymentDate: "2024-02-15T14:30:00Z",
      paymentMethod: "Credit Card",
    },
    {
      _id: "pay2",
      packageId: "pkg5",
      packageTitle: "Olimpiade Matematika SMA",
      amount: 200000,
      status: "completed",
      paymentDate: "2024-03-10T09:15:00Z",
      paymentMethod: "Bank Transfer",
    },
    {
      _id: "pay3",
      packageId: "pkg1",
      packageTitle: "UTBK Saintek 2024 - Matematika Dasar",
      amount: 175000,
      status: "pending",
      paymentDate: "2024-03-25T16:45:00Z",
      paymentMethod: "E-Wallet",
    },
  ];

  // Mock tryout history data
  const tryoutHistory: TryoutHistory[] = [
    {
      _id: "try1",
      packageId: "pkg2",
      packageTitle: "CPNS 2024 - Tes Wawasan Kebangsaan",
      score: 85,
      totalQuestions: 100,
      correctAnswers: 85,
      completedAt: "2024-02-20T10:30:00Z",
      duration: 85,
    },
    {
      _id: "try2",
      packageId: "pkg5",
      packageTitle: "Olimpiade Matematika SMA",
      score: 72,
      totalQuestions: 50,
      correctAnswers: 36,
      completedAt: "2024-03-15T14:20:00Z",
      duration: 220,
    },
    {
      _id: "try3",
      packageId: "pkg2",
      packageTitle: "CPNS 2024 - Tes Wawasan Kebangsaan",
      score: 91,
      totalQuestions: 100,
      correctAnswers: 91,
      completedAt: "2024-03-22T11:45:00Z",
      duration: 78,
    },
  ];

  const navigationTabs = [
    { id: "browse", label: "Browse Packages", icon: Package },
    { id: "my-packages", label: "My Packages", icon: BookOpen },
    { id: "payment-history", label: "Payment History", icon: CreditCard },
    { id: "tryout-history", label: "Tryout History", icon: FileText },
  ];

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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

    if (activeTab === "my-packages") {
      return pkg.isOwned && matchesSearch && matchesCategory;
    }

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

  const handleBuyPackage = (packageId: string) => {
    console.log("Buying package:", packageId);
    // Implement buy logic here
  };

  const handleViewDetail = (packageId: string) => {
    console.log("Viewing package detail:", packageId);
    // Implement view detail logic here
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      case "pending":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
      case "failed":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
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
            {/* Tab Navigation */}
            <div className="border-b border-gray-100 bg-gray-50/50">
              <nav className="flex space-x-0 overflow-x-auto px-6">
                {navigationTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-6 border-b-3 font-semibold text-sm flex items-center whitespace-nowrap transition-all duration-200 ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600 bg-white rounded-t-xl -mb-px"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-t-xl"
                      }`}
                    >
                      <IconComponent className="w-5 h-5 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Filters and Search */}
            {(activeTab === "browse" || activeTab === "my-packages") && (
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

            {/* Content */}
            <div className="p-6">
              {/* Package Browse/My Packages Content */}
              {(activeTab === "browse" || activeTab === "my-packages") && (
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
                        {activeTab === "my-packages"
                          ? "You haven't purchased any packages yet. Browse available packages to get started."
                          : "Try adjusting your search or filter criteria to find the perfect test package."}
                      </p>
                      {activeTab === "my-packages" && (
                        <button
                          onClick={() => setActiveTab("browse")}
                          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Browse Packages
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Payment History Content */}
              {activeTab === "payment-history" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Payment History
                    </h3>
                    <span className="text-sm text-gray-500">
                      {paymentHistory.length} transactions
                    </span>
                  </div>
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment._id}
                      className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            <h4 className="text-lg font-semibold text-gray-900">
                              {payment.packageTitle}
                            </h4>
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusBadge(
                                payment.status
                              )}`}
                            >
                              {payment.status.charAt(0).toUpperCase() +
                                payment.status.slice(1)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 font-medium">
                                Amount:
                              </span>
                              <p className="font-bold text-gray-900">
                                {formatCurrency(payment.amount)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">
                                Payment Method:
                              </span>
                              <p className="font-semibold text-gray-900">
                                {payment.paymentMethod}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">
                                Date:
                              </span>
                              <p className="font-semibold text-gray-900">
                                {formatDateTime(payment.paymentDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tryout History Content */}
              {activeTab === "tryout-history" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Tryout History
                    </h3>
                    <span className="text-sm text-gray-500">
                      {tryoutHistory.length} attempts
                    </span>
                  </div>
                  {tryoutHistory.map((tryout) => (
                    <div
                      key={tryout._id}
                      className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <h4 className="text-lg font-semibold text-gray-900">
                              {tryout.packageTitle}
                            </h4>
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white`}
                            >
                              Score: {tryout.score}%
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 font-medium">
                                Score:
                              </span>
                              <p
                                className={`font-bold text-2xl ${getScoreColor(
                                  tryout.score
                                )}`}
                              >
                                {tryout.score}%
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">
                                Correct Answers:
                              </span>
                              <p className="font-semibold text-gray-900">
                                {tryout.correctAnswers}/{tryout.totalQuestions}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">
                                Duration:
                              </span>
                              <p className="font-semibold text-gray-900">
                                {tryout.duration} minutes
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">
                                Completed:
                              </span>
                              <p className="font-semibold text-gray-900">
                                {formatDateTime(tryout.completedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

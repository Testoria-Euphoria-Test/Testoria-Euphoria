"use client";

import { useState } from "react";
import {
  Package,
  Clock,
  Search,
  ShoppingCart,
  Eye,
  BookOpen,
  Grid3X3,
  List,
  CreditCard,
  FileText,
} from "lucide-react";



interface Category {
  _id: string;
  name: string;
}

interface Package {
  _id: string;
  title: string;
  categoryId: string;
  creatorId: string;
  duration: number; // in minutes
  description: string;
  createdAt: string;
  // Additional fields for display purposes (would come from joins/calculations)
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
  duration: number; // actual time taken in minutes
}

export default function DashboardCustomerPage() {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("popular");



  // Mock categories data
  const categories: Category[] = [
    { _id: "all", name: "All Categories" },
    { _id: "cat1", name: "UTBK" },
    { _id: "cat2", name: "CPNS" },
    { _id: "cat3", name: "SNBT" },
    { _id: "cat4", name: "Kedinasan" },
    { _id: "cat5", name: "Olimpiade" },
  ];

  // Mock packages data
  const packages: Package[] = [
    {
      _id: "pkg1",
      title: "UTBK Saintek 2024 - Matematika Dasar",
      categoryId: "cat1",
      creatorId: "creator1",
      duration: 180,
      description:
        "Paket lengkap persiapan UTBK Saintek dengan fokus pada matematika dasar dan penalaran logika",
      createdAt: "2024-01-10T10:00:00Z",
      categoryName: "UTBK",
      creatorName: "Dr. Ahmad Susanto",
      isOwned: false,
    },
    {
      _id: "pkg2",
      title: "CPNS 2024 - Tes Wawasan Kebangsaan",
      categoryId: "cat2",
      creatorId: "creator2",
      duration: 90,
      description:
        "Persiapan komprehensif CPNS dengan fokus pada TWK dan materi terbaru sesuai kisi-kisi",
      createdAt: "2024-02-15T10:00:00Z",
      categoryName: "CPNS",
      creatorName: "Drs. Bambang Wijaya",
      isOwned: true,
    },
    {
      _id: "pkg3",
      title: "SNBT 2024 - Penalaran Matematika",
      categoryId: "cat3",
      creatorId: "creator3",
      duration: 195,
      description:
        "Simulasi lengkap SNBT dengan format terbaru dan analisis hasil yang mendalam",
      createdAt: "2024-03-01T10:00:00Z",
      categoryName: "SNBT",
      creatorName: "Prof. Siti Nurhaliza",
      isOwned: false,
    },
    {
      _id: "pkg4",
      title: "Try Out Kedinasan 2024",
      categoryId: "cat4",
      creatorId: "creator3",
      duration: 120,
      description:
        "Paket persiapan untuk berbagai sekolah kedinasan dengan prediksi soal yang akurat",
      createdAt: "2024-02-28T10:00:00Z",
      categoryName: "Kedinasan",
      creatorName: "Prof. Siti Nurhaliza",
      isOwned: false,
    },
    {
      _id: "pkg5",
      title: "Olimpiade Matematika SMA",
      categoryId: "cat5",
      creatorId: "creator1",
      duration: 240,
      description:
        "Persiapan olimpiade matematika tingkat SMA dengan soal-soal challenging dan pembahasan detail",
      createdAt: "2024-03-10T10:00:00Z",
      categoryName: "Olimpiade",
      creatorName: "Dr. Ahmad Susanto",
      isOwned: true,
    },
    {
      _id: "pkg6",
      title: "UTBK Soshum 2024 - Ekonomi & Geografi",
      categoryId: "cat1",
      creatorId: "creator1",
      duration: 180,
      description:
        "Try out UTBK Soshum dengan strategi khusus untuk ekonomi dan geografi",
      createdAt: "2024-01-20T10:00:00Z",
      categoryName: "UTBK",
      creatorName: "Dr. Ahmad Susanto",
      isOwned: false,
    },
  ];

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
      selectedCategory === "all" || pkg.categoryId === selectedCategory;

    if (activeTab === "my-packages") {
      return pkg.isOwned && matchesSearch && matchesCategory;
    }

    return matchesSearch && matchesCategory;
  });

  // Add sorting logic to ensure proper display
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
      default:
        return 0; // Keep original order for "popular"
    }
  });

  const handleBuyPackage = (packageId: string) => {
    // Handle buy package logic
    console.log("Buying package:", packageId);
  };

  const handleViewDetail = (packageId: string) => {
    // Handle view detail logic
    console.log("Viewing package detail:", packageId);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
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
                {sortedPackages.map((pkg) => (
                  <div
                    key={pkg._id}
                    className={`bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                      viewMode === "list"
                        ? "flex items-center p-6"
                        : "p-6 shadow-lg"
                    }`}
                  >
                    {viewMode === "grid" ? (
                      <>
                        {/* Grid View */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
                                {pkg.categoryName}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                              {pkg.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                              {pkg.description}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 font-medium">
                              Creator:
                            </span>
                            <span className="font-semibold text-gray-900">
                              {pkg.creatorName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 font-medium">
                              Duration:
                            </span>
                            <span className="font-semibold text-gray-900 flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-gray-400" />
                              {pkg.duration} minutes
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 font-medium">
                              Created:
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatDate(pkg.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-bold text-gray-900">
                              {pkg.categoryName} Package
                            </span>
                            {pkg.isOwned && (
                              <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
                                Owned
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleViewDetail(pkg._id)}
                              className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center shadow-sm"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Detail
                            </button>
                            {!pkg.isOwned && (
                              <button
                                onClick={() => handleBuyPackage(pkg._id)}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center shadow-lg"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Buy Now
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* List View */}
                        <div className="flex-1 flex items-center space-x-6">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                {pkg.categoryName}
                              </span>
                              {pkg.isOwned && (
                                <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white">
                                  Owned
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {pkg.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 font-medium">
                              by {pkg.creatorName}
                            </p>
                            <p className="text-sm text-gray-500 leading-relaxed">
                              {pkg.description}
                            </p>
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-gray-400" />
                              <span className="font-medium">
                                {pkg.duration}m
                              </span>
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-1 text-gray-400" />
                              <span className="font-medium">
                                {formatDate(pkg.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 mb-3">
                              {pkg.categoryName} Package
                            </p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewDetail(pkg._id)}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all duration-200"
                              >
                                View Detail
                              </button>
                              {!pkg.isOwned && (
                                <button
                                  onClick={() => handleBuyPackage(pkg._id)}
                                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md"
                                >
                                  Enroll
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
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

            {/* Empty State */}
            {sortedPackages.length === 0 &&
              (activeTab === "browse" || activeTab === "my-packages") && (
                <div className="text-center py-16">
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
                </div>
              )}

            {/* Empty State for Payment History */}
            {paymentHistory.length === 0 && activeTab === "payment-history" && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No payment history
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  You haven't made any payments yet. Purchase a package to see
                  your payment history here.
                </p>
              </div>
            )}

            {/* Empty State for Tryout History */}
            {tryoutHistory.length === 0 && activeTab === "tryout-history" && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No tryout history
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  You haven't taken any tryouts yet. Start with your purchased
                  packages to see your results here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

"use client";

import { useState } from "react";
import {
  Users,
  Package,
  BarChart3,
  Settings,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  MoreVertical,
  Check,
  X,
} from "lucide-react";

// Types based on database schema
interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "customer" | "creator";
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive";
  // Additional fields for display
  packagesOwned?: number;
  totalSpent?: number;
  packagesCreated?: number;
  totalEarnings?: number;
}

interface Category {
  _id: string;
  name: string;
}

interface Package {
  _id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  creatorId: string;
  creatorName: string;
  duration: number;
  description: string;
  createdAt: string;
  price: number;
  students: number;
  rating: number;
  status: "published" | "pending";
  totalQuestions: number;
}

export default function DashboardAdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Mock data for categories
  const categories: Category[] = [
    { _id: "cat1", name: "UTBK" },
    { _id: "cat2", name: "CPNS" },
    { _id: "cat3", name: "SNBT" },
    { _id: "cat4", name: "Kedinasan" },
  ];

  // Mock data for users based on database schema
  const users: User[] = [
    {
      _id: "user1",
      name: "John Doe",
      email: "john@example.com",
      role: "customer",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
      status: "active",
      packagesOwned: 3,
      totalSpent: 450000,
    },
    {
      _id: "user2",
      name: "Dr. Ahmad Susanto",
      email: "ahmad@example.com",
      role: "creator",
      createdAt: "2023-12-01T10:00:00Z",
      updatedAt: "2023-12-01T10:00:00Z",
      status: "active",
      packagesCreated: 5,
      totalEarnings: 2500000,
    },
    {
      _id: "user3",
      name: "Maria Silva",
      email: "maria@example.com",
      role: "customer",
      createdAt: "2024-02-10T10:00:00Z",
      updatedAt: "2024-02-10T10:00:00Z",
      status: "active",
      packagesOwned: 2,
      totalSpent: 300000,
    },
    {
      _id: "user4",
      name: "Prof. Siti Nurhaliza",
      email: "siti@example.com",
      role: "creator",
      createdAt: "2023-11-15T10:00:00Z",
      updatedAt: "2023-11-15T10:00:00Z",
      status: "active",
      packagesCreated: 3,
      totalEarnings: 1800000,
    },
    {
      _id: "user5",
      name: "Admin User",
      email: "admin@testoria.com",
      role: "admin",
      createdAt: "2023-10-01T10:00:00Z",
      updatedAt: "2023-10-01T10:00:00Z",
      status: "active",
    },
    {
      _id: "user6",
      name: "Drs. Bambang Wijaya",
      email: "bambang@example.com",
      role: "creator",
      createdAt: "2023-12-15T10:00:00Z",
      updatedAt: "2023-12-15T10:00:00Z",
      status: "active",
      packagesCreated: 2,
      totalEarnings: 1200000,
    },
  ];

  // Mock data for packages based on database schema - using state to allow updates
  const [packages, setPackages] = useState<Package[]>([
    {
      _id: "pkg1",
      title: "UTBK Saintek 2024",
      categoryId: "cat1",
      categoryName: "UTBK",
      creatorId: "user2",
      creatorName: "Dr. Ahmad Susanto",
      duration: 180,
      description:
        "Paket lengkap try out UTBK Saintek dengan soal-soal terbaru dan pembahasan detail",
      createdAt: "2024-01-10T10:00:00Z",
      price: 150000,
      students: 1250,
      rating: 4.8,
      status: "published",
      totalQuestions: 100,
    },
    {
      _id: "pkg2",
      title: "CPNS 2024 - TWK",
      categoryId: "cat2",
      categoryName: "CPNS",
      creatorId: "user6",
      creatorName: "Drs. Bambang Wijaya",
      duration: 90,
      description:
        "Paket try out CPNS fokus Tes Wawasan Kebangsaan dengan materi terkini",
      createdAt: "2024-01-20T10:00:00Z",
      price: 100000,
      students: 756,
      rating: 4.7,
      status: "published",
      totalQuestions: 35,
    },
    {
      _id: "pkg3",
      title: "SNBT 2024 Draft",
      categoryId: "cat3",
      categoryName: "SNBT",
      creatorId: "user4",
      creatorName: "Prof. Siti Nurhaliza",
      duration: 195,
      description:
        "Simulasi lengkap SNBT dengan format terbaru dan analisis hasil detail",
      createdAt: "2024-03-01T10:00:00Z",
      price: 200000,
      students: 0,
      rating: 0,
      status: "published",
      totalQuestions: 120,
    },
    {
      _id: "pkg4",
      title: "UTBK Soshum 2024",
      categoryId: "cat1",
      categoryName: "UTBK",
      creatorId: "user2",
      creatorName: "Dr. Ahmad Susanto",
      duration: 180,
      description:
        "Try out UTBK Soshum dengan soal prediksi dan strategi pengerjaan yang efektif",
      createdAt: "2024-02-15T10:00:00Z",
      price: 150000,
      students: 980,
      rating: 4.9,
      status: "published",
      totalQuestions: 100,
    },
    {
      _id: "pkg5",
      title: "Try Out Kedinasan 2024",
      categoryId: "cat4",
      categoryName: "Kedinasan",
      creatorId: "user4",
      creatorName: "Prof. Siti Nurhaliza",
      duration: 120,
      description:
        "Paket try out untuk berbagai sekolah kedinasan dengan soal prediksi akurat",
      createdAt: "2024-02-28T10:00:00Z",
      price: 175000,
      students: 834,
      rating: 4.8,
      status: "pending",
      totalQuestions: 80,
    },
    {
      _id: "pkg6",
      title: "CPNS 2024 - TKP",
      categoryId: "cat2",
      categoryName: "CPNS",
      creatorId: "user6",
      creatorName: "Drs. Bambang Wijaya",
      duration: 90,
      description: "Paket try out CPNS fokus Tes Karakteristik Pribadi",
      createdAt: "2024-03-05T10:00:00Z",
      price: 100000,
      students: 0,
      rating: 0,
      status: "pending",
      totalQuestions: 35,
    },
  ]);

  const stats = [
    {
      label: "Total Users",
      value: users.length.toString(),
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Total Packages",
      value: packages.length.toString(),
      change: "+8%",
      icon: Package,
      color: "text-green-600",
    },
    {
      label: "Active Creators",
      value: users
        .filter((u) => u.role === "creator" && u.status === "active")
        .length.toString(),
      change: "+15%",
      icon: BarChart3,
      color: "text-purple-600",
    },
    {
      label: "Published Packages",
      value: packages.filter((p) => p.status === "published").length.toString(),
      change: "+23%",
      icon: Settings,
      color: "text-orange-600",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
    };
    return (
      statusClasses[status as keyof typeof statusClasses] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const getRoleBadge = (role: string) => {
    const roleClasses = {
      admin: "bg-red-100 text-red-800",
      creator: "bg-purple-100 text-purple-800",
      customer: "bg-blue-100 text-blue-800",
    };
    return (
      roleClasses[role as keyof typeof roleClasses] ||
      "bg-gray-100 text-gray-800"
    );
  };

  // Functions for handling package status updates
  const handleEditStatus = (packageId: string, currentStatus: string) => {
    setEditingPackageId(packageId);
    setSelectedStatus(currentStatus);
  };

  const handleSaveStatus = (packageId: string) => {
    setPackages((prevPackages) =>
      prevPackages.map((pkg) =>
        pkg._id === packageId
          ? {
              ...pkg,
              status: selectedStatus as "published" | "pending",
            }
          : pkg
      )
    );
    setEditingPackageId(null);
    setSelectedStatus("");
  };

  const handleCancelEdit = () => {
    setEditingPackageId(null);
    setSelectedStatus("");
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Kelola platform dan monitor aktivitas
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      {stat.change}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50">
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "users", label: "Users Management" },
                { id: "packages", label: "Package Management" },
                { id: "categories", label: "Categories" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">

            {/* Users Management Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Join Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString(
                              "id-ID"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.role === "customer" &&
                            user.packagesOwned &&
                            user.totalSpent
                              ? `${
                                  user.packagesOwned
                                } packages • ${formatCurrency(user.totalSpent)}`
                              : user.role === "creator" &&
                                user.packagesCreated &&
                                user.totalEarnings
                              ? `${
                                  user.packagesCreated
                                } packages • ${formatCurrency(
                                  user.totalEarnings
                                )}`
                              : user.role === "admin"
                              ? "System Administrator"
                              : "No activity"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Package Management Tab */}
            {activeTab === "packages" && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search packages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Pending:{" "}
                      {packages.filter((p) => p.status === "pending").length}
                    </span>
                    <span className="text-sm text-gray-600">
                      Published:{" "}
                      {packages.filter((p) => p.status === "published").length}
                    </span>
                  </div>
                </div>

                {/* Packages Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Package
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Creator
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPackages.map((pkg) => (
                        <tr key={pkg._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {pkg.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {pkg.totalQuestions} questions • {pkg.duration}{" "}
                                minutes
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {pkg.creatorName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {pkg.categoryName}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(pkg.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {pkg.students}
                            </div>
                            {pkg.rating > 0 && (
                              <div className="text-sm text-gray-500">
                                ⭐ {pkg.rating}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingPackageId === pkg._id ? (
                              <div className="flex items-center space-x-2">
                                <select
                                  value={selectedStatus}
                                  onChange={(e) =>
                                    setSelectedStatus(e.target.value)
                                  }
                                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="published">Published</option>
                                </select>
                                <button
                                  onClick={() => handleSaveStatus(pkg._id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                                    pkg.status
                                  )}`}
                                >
                                  {pkg.status}
                                </span>
                                <button
                                  onClick={() =>
                                    handleEditStatus(pkg._id, pkg.status)
                                  }
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit Status"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="text-green-600 hover:text-green-900"
                                title="Edit Package"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900"
                                title="Delete Package"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                className="text-gray-600 hover:text-gray-900"
                                title="More Options"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Categories Management
                  </h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {category.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {
                              packages.filter(
                                (p) => p.categoryId === category._id
                              ).length
                            }{" "}
                            packages
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

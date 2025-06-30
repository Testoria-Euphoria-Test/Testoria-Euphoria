"use client";

import { useState, useEffect } from "react";
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
  Check,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import toast, { Toaster } from 'react-hot-toast';

// Types based on database schema
interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "customer" | "creator";
  createdAt: string;
  updatedAt?: string;
  status?: "active" | "inactive";
  // Additional fields for display
  packagesOwned?: number;
  totalSpent?: number;
  packagesCreated?: number;
  totalEarnings?: number;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  packageCount?: number;
}

interface Package {
  _id: string;
  title: string;
  categoryId: string;
  categoryName?: string;
  creatorId: string;
  creatorName?: string;
  duration: number;
  description: string;
  createdAt: string;
  price: number;
  rating?: number;
  isPublished: boolean;
  totalQuestions?: number;
  totalStudents?: number;
}

interface AdminStats {
  totalUsers: number;
  totalPackages: number;
  totalCategories: number;
  activeCreators: number;
  publishedPackages: number;
  pendingPackages: number;
  totalRevenue: number;
  users: User[];
  packages: Package[];
  categories: Category[];
}

export default function DashboardAdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for real data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // New category form state
  const [newCategory, setNewCategory] = useState({ name: "", description: "", icon: "" });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  // Edit category state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryForm, setEditCategoryForm] = useState<{ name: string; description: string }>({
    name: "", description: ""
  });
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

  // User management state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewingUser, setIsViewingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState<{ name: string; email: string; role: "admin" | "customer" | "creator"; status: "active" | "inactive" }>({
    name: "", email: "", role: "customer", status: "active"
  });

  // Filter state for users
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter state for packages
  const [packageCategoryFilter, setPackageCategoryFilter] = useState<string>("all");
  const [packageStatusFilter, setPackageStatusFilter] = useState<string>("all");

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'user' | 'category' | 'package' | null;
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: null,
    id: '',
    name: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch data directly from API endpoints
      const [usersResponse, packagesResponse, categoriesResponse] = await Promise.all([
        fetch('/api/users', { credentials: 'include' }),
        fetch('/api/packages?withDetails=true', { credentials: 'include' }),
        fetch('/api/categories', { credentials: 'include' })
      ]);

      if (!usersResponse.ok || !packagesResponse.ok || !categoriesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const usersData = await usersResponse.json();
      const packagesData = await packagesResponse.json();
      const categoriesData = await categoriesResponse.json();

      const users = usersData.data || [];
      const rawPackages = packagesData.data || [];
      const categories = categoriesData.data || [];

      // Enrich users with default status if not present
      const enrichedUsers = users.map((user: any) => ({
        ...user,
        status: user.status || 'active' // Default to active if status not present
      }));

      // Enrich packages with creator and category names
      const packages = rawPackages.map((pkg: any) => {
        return {
          _id: pkg._id,
          title: pkg.title,
          categoryId: pkg.categoryId,
          categoryName: pkg.category?.name || 'Unknown Category',
          creatorId: pkg.creatorId,
          creatorName: pkg.creator?.name || pkg.creator?.email || 'Unknown Creator', // Prefer name, fallback to email
          duration: pkg.duration,
          description: pkg.description,
          createdAt: pkg.createdAt,
          price: pkg.price,
          rating: pkg.rating || 0,
          isPublished: pkg.isPublished,
          totalQuestions: pkg.contents?.length || 0,
          totalStudents: pkg.totalStudents || 0
        };
      });

      // Calculate stats
      const statsData = {
        totalUsers: enrichedUsers.length,
        totalPackages: packages.length,
        totalCategories: categories.length,
        activeCreators: enrichedUsers.filter((u: any) => u.role === 'creator' && u.status === 'active').length,
        publishedPackages: packages.filter((p: any) => p.isPublished).length,
        pendingPackages: packages.filter((p: any) => !p.isPublished).length,
        totalRevenue: packages.reduce((sum: number, p: any) => sum + (p.price * (p.totalStudents || 0)), 0),
        users: enrichedUsers,
        packages,
        categories
      };

      setStats(statsData);
      setUsers(enrichedUsers);
      setPackages(packages);
      setCategories(categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load packages with current filters
  const loadPackagesWithFilters = async () => {
    try {
      // Build query parameters for API
      const queryParams = new URLSearchParams();
      queryParams.append('withDetails', 'true');

      if (searchTerm) queryParams.append('search', searchTerm);
      if (packageCategoryFilter && packageCategoryFilter !== 'all') {
        queryParams.append('categoryId', packageCategoryFilter);
      }
      if (packageStatusFilter && packageStatusFilter !== 'all') {
        queryParams.append('status', packageStatusFilter);
      }

      const response = await fetch(`/api/packages?${queryParams.toString()}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }

      const packagesData = await response.json();
      const rawPackages = packagesData.data || [];

      // Enrich packages with creator and category names
      const packages = rawPackages.map((pkg: any) => {
        return {
          _id: pkg._id,
          title: pkg.title,
          categoryId: pkg.categoryId,
          categoryName: pkg.category?.name || 'Unknown Category',
          creatorId: pkg.creatorId,
          creatorName: pkg.creator?.name || pkg.creator?.email || 'Unknown Creator',
          duration: pkg.duration,
          description: pkg.description,
          createdAt: pkg.createdAt,
          price: pkg.price,
          rating: pkg.rating || 0,
          isPublished: pkg.isPublished,
          totalQuestions: pkg.contents?.length || 0,
          totalStudents: pkg.totalStudents || 0
        };
      });

      setPackages(packages);

      // Update stats if needed
      if (stats) {
        setStats({
          ...stats,
          totalPackages: packages.length,
          publishedPackages: packages.filter((p: any) => p.isPublished).length,
          pendingPackages: packages.filter((p: any) => !p.isPublished).length,
          packages
        });
      }
    } catch (err) {
      console.error('Error loading packages:', err);
      toast.error('Failed to load packages');
    }
  };

  // Debounced search effect for packages
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeTab === 'packages') {
        loadPackagesWithFilters();
      }
    }, 500); // 500ms delay for search

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, packageCategoryFilter, packageStatusFilter, activeTab]);

  // Handle package status update
  const handleUpdatePackageStatus = async (packageId: string, isPublished: boolean) => {
    try {
      // Use the publish API endpoint for status updates
      const response = await fetch(`/api/packages/${packageId}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPublished })
      });

      if (!response.ok) {
        throw new Error('Failed to update package status');
      }

      // Update local state
      setPackages(prev => prev.map(pkg =>
        pkg._id === packageId ? { ...pkg, isPublished } : pkg
      ));

      setEditingPackageId(null);
    } catch (err) {
      console.error('Error updating package status:', err);
      toast.error('Failed to update package status');
    }
  };

  // Handle user role/status update
  const handleUpdateUser = async (userId: string, updates: { role?: "admin" | "customer" | "creator"; status?: "active" | "inactive" }) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Update local state
      setUsers(prev => prev.map(user =>
        user._id === userId ? { ...user, ...updates } : user
      ));
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error('Failed to update user');
    }
  };

  // Handle create category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    setIsCreatingCategory(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newCategory.name.trim(),
          description: newCategory.description.trim() || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      const result = await response.json();

      // Add to local state
      setCategories(prev => [...prev, result.data]);

      // Reset form and close modal
      setNewCategory({ name: "", description: "", icon: "" });
      setShowAddCategoryModal(false);
      toast.success('Kategori berhasil dibuat');
    } catch (err) {
      console.error('Error creating category:', err);
      toast.error('Gagal membuat kategori');
    } finally {
      setIsCreatingCategory(false);
    }
  };
  // Handle delete category
  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId);
    if (!category) return;

    setDeleteConfirmation({
      isOpen: true,
      type: 'category',
      id: categoryId,
      name: category.name
    });
  };

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category._id);
    setEditCategoryForm({
      name: category.name,
      description: category.description || ""
    });
  };

  // Handle save category changes
  const handleSaveCategoryChanges = async () => {
    if (!editingCategoryId) return;

    setIsUpdatingCategory(true);
    try {
      const response = await fetch(`/api/categories/${editingCategoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editCategoryForm.name.trim(),
          description: editCategoryForm.description.trim() || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      const result = await response.json();

      // Update local state
      setCategories(prev => prev.map(cat =>
        cat._id === editingCategoryId ? { ...cat, ...editCategoryForm } : cat
      ));

      // Reset editing state
      setEditingCategoryId(null);
      setEditCategoryForm({ name: "", description: "" });
      toast.success('Kategori berhasil diperbarui');
    } catch (err) {
      console.error('Error updating category:', err);
      toast.error('Gagal memperbarui kategori');
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  // Handle cancel edit category
  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditCategoryForm({ name: "", description: "" });
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string, userName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'user',
      id: userId,
      name: userName
    });
  };

  // Handle delete package
  const handleDeletePackage = async (packageId: string, packageTitle: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'package',
      id: packageId,
      name: packageTitle
    });
  };

  // Confirm deletion
  const confirmDelete = async () => {
    const { type, id, name } = deleteConfirmation;

    try {
      if (type === 'user') {
        const response = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        // Remove from local state
        setUsers(prev => prev.filter(user => user._id !== id));
        toast.success(`Pengguna "${name}" berhasil dihapus`);

      } else if (type === 'category') {
        const response = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to delete category');
        }

        // Remove from local state
        setCategories(prev => prev.filter(cat => cat._id !== id));
        toast.success(`Kategori "${name}" berhasil dihapus`);

      } else if (type === 'package') {
        const response = await fetch(`/api/packages/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to delete package');
        }

        // Remove from local state
        setPackages(prev => prev.filter(pkg => pkg._id !== id));

        // Update stats if needed
        if (stats) {
          const updatedPackages = packages.filter(pkg => pkg._id !== id);
          setStats({
            ...stats,
            totalPackages: updatedPackages.length,
            publishedPackages: updatedPackages.filter((p: any) => p.isPublished).length,
            pendingPackages: updatedPackages.filter((p: any) => !p.isPublished).length,
            packages: updatedPackages
          });
        }

        toast.success(`Paket "${name}" berhasil dihapus`);
      }
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      toast.error(`Gagal menghapus ${type}`);
    } finally {
      setDeleteConfirmation({
        isOpen: false,
        type: null,
        id: '',
        name: ''
      });
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      type: null,
      id: '',
      name: ''
    });
  };

  // Handle view user details
  const handleViewUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const result = await response.json();
      setSelectedUser(result.data);
      setIsViewingUser(true);
    } catch (err) {
      console.error('Error fetching user details:', err);
      toast.error('Gagal mengambil detail pengguna');
    }
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditingUserId(user._id);
    setEditUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'active'
    });
  };

  // Handle save user changes
  const handleSaveUserChanges = async () => {
    if (!editingUserId) return;

    try {
      const response = await fetch(`/api/users/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editUserForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Update local state
      setUsers(prev => prev.map(user =>
        user._id === editingUserId ? { ...user, ...editUserForm } : user
      ));

      // Reset editing state
      setEditingUserId(null);
      setEditUserForm({ name: "", email: "", role: "customer", status: "active" });
      toast.success('Pengguna berhasil diperbarui');
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error('Gagal memperbarui pengguna');
    }
  };

  // Handle cancel edit
  const handleCancelEditUser = () => {
    setEditingUserId(null);
    setEditUserForm({ name: "", email: "", role: "customer", status: "active" });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPackageCategoryFilter("all");
    setPackageStatusFilter("all");
  };

  // Clear user filters only
  const clearUserFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  // Clear package filters only
  const clearPackageFilters = async () => {
    setSearchTerm("");
    setPackageCategoryFilter("all");
    setPackageStatusFilter("all");

    // Reload packages without filters
    try {
      const response = await fetch('/api/packages?withDetails=true', { credentials: 'include' });
      if (response.ok) {
        const packagesData = await response.json();
        const rawPackages = packagesData.data || [];

        const packages = rawPackages.map((pkg: any) => ({
          _id: pkg._id,
          title: pkg.title,
          categoryId: pkg.categoryId,
          categoryName: pkg.category?.name || 'Unknown Category',
          creatorId: pkg.creatorId,
          creatorName: pkg.creator?.name || pkg.creator?.email || 'Unknown Creator',
          duration: pkg.duration,
          description: pkg.description,
          createdAt: pkg.createdAt,
          price: pkg.price,
          rating: pkg.rating || 0,
          isPublished: pkg.isPublished,
          totalQuestions: pkg.contents?.length || 0,
          totalStudents: pkg.totalStudents || 0
        }));

        setPackages(packages);

        if (stats) {
          setStats({
            ...stats,
            totalPackages: packages.length,
            publishedPackages: packages.filter((p: any) => p.isPublished).length,
            pendingPackages: packages.filter((p: any) => !p.isPublished).length,
            packages
          });
        }
      }
    } catch (err) {
      console.error('Error clearing package filters:', err);
      toast.error('Gagal menghapus filter paket');
    }
  };

  const statsData = stats ? [
    {
      label: "Total Users",
      value: stats.totalUsers.toString(),
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Total Packages",
      value: stats.totalPackages.toString(),
      change: "+8%",
      icon: Package,
      color: "text-green-600",
    },
    {
      label: "Active Creators",
      value: stats.activeCreators.toString(),
      change: "+15%",
      icon: BarChart3,
      color: "text-purple-600",
    },
    {
      label: "Published Packages",
      value: stats.publishedPackages.toString(),
      change: "+23%",
      icon: Settings,
      color: "text-orange-600",
    },
  ] : [];

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
  const handleEditStatus = (packageId: string, currentStatus: boolean) => {
    setEditingPackageId(packageId);
    setSelectedStatus(currentStatus ? "published" : "draft");
  };

  const handleSaveStatus = (packageId: string) => {
    const isPublished = selectedStatus === "published";
    handleUpdatePackageStatus(packageId, isPublished);
  };

  const handleCancelEdit = () => {
    setEditingPackageId(null);
    setSelectedStatus("");
  };

  const filteredUsers = users.filter((user) => {
    // Search filter - check name and email
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    // Status filter
    const matchesStatus = statusFilter === "all" || (user.status || "active") === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Since we're doing server-side filtering, we can just use the packages directly
  // Client-side filtering is kept as fallback for immediate UI response
  const filteredPackages = packages.filter((pkg) => {
    // Search filter - check package title and creator name (fallback for immediate response)
    const matchesSearch = !searchTerm ||
      pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.creatorName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    // Category filter (fallback for immediate response)
    const matchesCategory = packageCategoryFilter === "all" || pkg.categoryId === packageCategoryFilter;

    // Status filter (fallback for immediate response)
    const matchesStatus = packageStatusFilter === "all" ||
      (packageStatusFilter === "published" && pkg.isPublished) ||
      (packageStatusFilter === "draft" && !pkg.isPublished);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Loading state
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Kesalahan: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
            <button
              onClick={loadDashboardData}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => {
              const IconComponent = stat.icon;
              // Ubah label statistik ke Bahasa Indonesia
              const labelMap: Record<string, string> = {
                "Total Users": "Total Pengguna",
                "Total Packages": "Total Paket",
                "Active Creators": "Creator Aktif",
                "Published Packages": "Paket Terpublikasi",
              };
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {labelMap[stat.label] || stat.label}
                      </p>
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
                  { id: "users", label: "Kelola Pengguna" },
                  { id: "packages", label: "Kelola Paket" },
                  { id: "categories", label: "Kelola Kategori" },
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
                          placeholder="Cari nama atau email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-gray-600"
                        />
                      </div>

                      {/* Role Filter */}
                      <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparen text-gray-600"
                        >
                          <option value="all">Semua Role</option>
                          <option value="admin">Admin</option>
                          <option value="creator">Creator</option>
                          <option value="customer">Customer</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div className="flex items-center space-x-2">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                        >
                          <option value="all">Semua Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      {/* Clear Filters Button */}
                      {(searchTerm ||
                        roleFilter !== "all" ||
                        statusFilter !== "all") && (
                        <button
                          onClick={clearUserFilters}
                          className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Hapus Filter
                        </button>
                      )}
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="font-medium">
                        Menampilkan {filteredUsers.length} dari {users.length}{" "}
                        pengguna
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Active:{" "}
                          {
                            users.filter(
                              (u) => (u.status || "active") === "active"
                            ).length
                          }
                        </span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Inactive:{" "}
                          {users.filter((u) => u.status === "inactive").length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama Pengguna
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal Bergabung
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
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
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                                  user.status || "active"
                                )}`}
                              >
                                {user.status || "active"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewUser(user._id)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Lihat Detail"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Edit Pengguna"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {user.role !== "admin" && (
                                  <button
                                    onClick={() =>
                                      handleDeleteUser(user._id, user.name)
                                    }
                                    className="text-red-600 hover:text-red-900"
                                    title="Hapus Pengguna"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
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
                          placeholder="Cari paket atau creator..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-gray-600"
                        />
                      </div>

                      {/* Category Filter */}
                      <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                          value={packageCategoryFilter}
                          onChange={(e) =>
                            setPackageCategoryFilter(e.target.value)
                          }
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                        >
                          <option value="all">Semua Kategori</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div className="flex items-center space-x-2">
                        <select
                          value={packageStatusFilter}
                          onChange={(e) =>
                            setPackageStatusFilter(e.target.value)
                          }
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                        >
                          <option value="all">Semua Status</option>
                          <option value="published">Terpublikasi</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>

                      {/* Clear Filters Button */}
                      {(searchTerm ||
                        packageCategoryFilter !== "all" ||
                        packageStatusFilter !== "all") && (
                        <button
                          onClick={clearPackageFilters}
                          className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Hapus Filter
                        </button>
                      )}
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="font-medium">
                        Menampilkan {filteredPackages.length} dari{" "}
                        {packages.length} paket
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Terpublikasi:{" "}
                          {packages.filter((p) => p.isPublished).length}
                        </span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Draft: {packages.filter((p) => !p.isPublished).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Packages Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama Paket
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Creator
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kategori
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Harga
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
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
                                  {pkg.totalQuestions} questions •{" "}
                                  {pkg.duration} minutes
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
                              {editingPackageId === pkg._id ? (
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={selectedStatus}
                                    onChange={(e) =>
                                      setSelectedStatus(e.target.value)
                                    }
                                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="draft">draft</option>
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
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      pkg.isPublished
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {pkg.isPublished ? "Terpublikasi" : "Draft"}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleEditStatus(pkg._id, pkg.isPublished)
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
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={() =>
                                    handleDeletePackage(pkg._id, pkg.title)
                                  }
                                  className="text-red-600 hover:text-red-900"
                                  title="Hapus Paket"
                                >
                                  <Trash2 className="w-4 h-4" />
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
                      Kelola Kategori
                    </h3>
                    <button
                      onClick={() => setShowAddCategoryModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Kategori
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <div className="text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium text-gray-900 mb-2">
                            Belum ada kategori
                          </p>
                          <p className="text-gray-600 mb-4">
                            Buat kategori pertama Anda untuk mengelola paket
                          </p>
                          <button
                            onClick={() => setShowAddCategoryModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 inline-flex items-center"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Kategori Pertama
                          </button>
                        </div>
                      </div>
                    ) : (
                      categories.map((category) => (
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
                                paket
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="text-green-600 hover:text-green-900"
                                title="Edit Kategori"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteCategory(category._id)
                                }
                                className="text-red-600 hover:text-red-900"
                                title="Hapus Kategori"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Add Category Modal */}
          {showAddCategoryModal && (
            <div className="fixed inset-0 bg-gray-300 bg-opacity-10 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Tambah Kategori Baru
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddCategoryModal(false);
                      setNewCategory({ name: "", description: "", icon: "" });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleCreateCategory}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nama Kategori *
                      </label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-medium focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        placeholder="Masukkan nama kategori"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Deskripsi (Opsional)
                      </label>
                      <textarea
                        value={newCategory.description}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-medium focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        placeholder="Masukkan deskripsi kategori"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCategoryModal(false);
                        setNewCategory({ name: "", description: "", icon: "" });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      disabled={isCreatingCategory}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isCreatingCategory || !newCategory.name.trim()}
                    >
                      {isCreatingCategory ? "Membuat..." : "Buat Kategori"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Category Modal */}
          {editingCategoryId && (
            <div className="fixed inset-0 bg-gray-300 bg-opacity-10 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Edit Kategori
                  </h3>
                  <button
                    onClick={handleCancelEditCategory}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveCategoryChanges();
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nama Kategori *
                      </label>
                      <input
                        type="text"
                        value={editCategoryForm.name}
                        onChange={(e) =>
                          setEditCategoryForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-medium focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        placeholder="Masukkan nama kategori"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Deskripsi (Opsional)
                      </label>
                      <textarea
                        value={editCategoryForm.description}
                        onChange={(e) =>
                          setEditCategoryForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-medium focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        placeholder="Masukkan deskripsi kategori"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={handleCancelEditCategory}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      disabled={isUpdatingCategory}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        isUpdatingCategory || !editCategoryForm.name.trim()
                      }
                    >
                      {isUpdatingCategory
                        ? "Memperbarui..."
                        : "Perbarui Kategori"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* User Details Modal */}
          {isViewingUser && selectedUser && (
            <div className="fixed inset-0 bg-gray-300 bg-opacity-10 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detail Pengguna
                  </h3>
                  <button
                    onClick={() => setIsViewingUser(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nama
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
                        selectedUser.role
                      )}`}
                    >
                      {selectedUser.role}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        selectedUser.status || "active"
                      )}`}
                    >
                      {selectedUser.status === "inactive"
                        ? "Inactive"
                        : "Active"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bergabung
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedUser.createdAt).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  {selectedUser.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Terakhir Diperbarui
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedUser.updatedAt).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {editingUserId && (
            <div className="fixed inset-0 bg-gray-300 bg-opacity-10 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Edit Pengguna
                  </h3>
                  <button
                    onClick={handleCancelEditUser}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveUserChanges();
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nama
                      </label>
                      <input
                        type="text"
                        value={editUserForm.name}
                        onChange={(e) =>
                          setEditUserForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editUserForm.email}
                        onChange={(e) =>
                          setEditUserForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        value={editUserForm.role}
                        onChange={(e) =>
                          setEditUserForm((prev) => ({
                            ...prev,
                            role: e.target.value as
                              | "admin"
                              | "customer"
                              | "creator",
                          }))
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="customer">Customer</option>
                        <option value="creator">Creator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        value={editUserForm.status}
                        onChange={(e) =>
                          setEditUserForm((prev) => ({
                            ...prev,
                            status: e.target.value as "active" | "inactive",
                          }))
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={handleCancelEditUser}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-10 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Konfirmasi Hapus
              </h3>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-700">
                Apakah Anda yakin ingin menghapus {deleteConfirmation.type} "
                {deleteConfirmation.name}"? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4aed88",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ff4b4b",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
}

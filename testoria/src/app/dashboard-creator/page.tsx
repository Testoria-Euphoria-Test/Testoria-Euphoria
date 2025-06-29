"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  FileText,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Users,
  DollarSign,
  Star,
  Download,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import toast, { Toaster } from 'react-hot-toast';

// Types
interface CreatorProfile {
  _id: string;
  name: string;
  email: string;
  education: string;
  certificates: string[];
  bio: string;
  avatar?: string;
  totalPackages: number;
  totalStudents: number;
  totalEarnings: number;
  rating: number;
  joinDate: string;
}

interface Package {
  _id: string;
  title: string;
  description: string;
  sourcePdf: string[];
  pdfImages: string[];
  contents: any[];
  categoryId: string;
  creatorId: string;
  duration: number;
  price: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt?: Date;
  // Optional fields from API joins
  categoryName?: string;
  creatorName?: string;
}

interface UploadedPDF {
  _id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  packageId?: string;
  packageTitle?: string;
  status: "processing" | "ready" | "error";
}

export default function DashboardCreatorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("packages");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real data state
  const [packages, setPackages] = useState<Package[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Package>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Load creator data on component mount
  useEffect(() => {
    loadCreatorData();
  }, []);

  const loadCreatorData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First check if user is authenticated
      const authResponse = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!authResponse.ok) {
        if (authResponse.status === 401) {
          setError('You need to log in to access this page. Please login first.');
          setLoading(false);
          return;
        }
        throw new Error('Authentication check failed');
      }

      const authData = await authResponse.json();
      
      // Set user role from auth response
      setUserRole(authData.data.userRole || 'creator');
      
      // Fetch creator's packages
      const packagesResponse = await fetch('/api/packages/my-packages', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!packagesResponse.ok) {
        if (packagesResponse.status === 401) {
          setError('You need to log in to access this page. Please login first.');
          setLoading(false);
          return;
        }
        
        // Try to get error details from response
        let errorMessage = 'Failed to fetch packages';
        try {
          const errorData = await packagesResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the default message
        }
        
        throw new Error(`API Error ${packagesResponse.status}: ${errorMessage}`);
      }

      const packagesData = await packagesResponse.json();
      
      if (!packagesData.success) {
        throw new Error(packagesData.message || 'API returned unsuccessful response');
      }

      const fetchedPackages = packagesData.data || [];
      setPackages(fetchedPackages);

      // Calculate stats from packages
      const totalPackages = fetchedPackages.length;
      const publishedPackages = fetchedPackages.filter((pkg: Package) => pkg.isPublished);
      const totalStudents = 0; // This would come from enrollment data
      const totalEarnings = 0; // This would come from sales data
      const avgRating = 0; // This would come from review data

      // Set creator profile with calculated stats
      setCreatorProfile({
        _id: authData.data.userId, // Use the actual user ID from auth
        name: "Creator", // This would come from user profile API
        email: authData.data.userEmail || "creator@testoria.com", // Use auth email
        education: "",
        certificates: [],
        bio: "",
        totalPackages,
        totalStudents,
        totalEarnings,
        rating: avgRating,
        joinDate: new Date().toISOString(),
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load creator data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mock data for uploaded PDFs
  const [uploadedPDFs, setUploadedPDFs] = useState<UploadedPDF[]>([
    {
      _id: "pdf1",
      fileName: "UTBK_Matematika_Soal_Bank.pdf",
      fileSize: "2.5 MB",
      uploadDate: "2024-01-10T10:00:00Z",
      packageId: "pkg1",
      packageTitle: "UTBK Saintek 2024 - Matematika Dasar",
      status: "ready",
    },
    {
      _id: "pdf2",
      fileName: "Pembahasan_UTBK_Soshum.pdf",
      fileSize: "3.2 MB",
      uploadDate: "2024-02-15T10:00:00Z",
      packageId: "pkg2",
      packageTitle: "UTBK Soshum 2024 - Ekonomi & Geografi",
      status: "ready",
    },
    {
      _id: "pdf3",
      fileName: "Draft_Olimpiade_Math.pdf",
      fileSize: "1.8 MB",
      uploadDate: "2024-03-01T10:00:00Z",
      packageId: "pkg3",
      packageTitle: "Matematika Olimpiade SMA",
      status: "processing",
    },
  ]);

  // Currency formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      label: "Total Packages",
      value: creatorProfile?.totalPackages.toString() || "0",
      change: "+2 this month",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      label: "Total Students",
      value: creatorProfile?.totalStudents.toLocaleString() || "0",
      change: "+15% this month",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      label: "Total Earnings",
      value: formatCurrency(creatorProfile?.totalEarnings || 0),
      change: "+28% this month",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      label: "Average Rating",
      value: creatorProfile?.rating.toString() || "0",
      change: "4.9/5.0 stars",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
  ];

  const navigationTabs = [
    { id: "packages", label: "My Packages", icon: Package },
    { id: "uploads", label: "Upload Materials", icon: FileText },
  ];

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      published: "bg-green-100 text-green-700 border-green-200",
      draft: "bg-yellow-100 text-yellow-700 border-yellow-200",
      pending: "bg-blue-100 text-blue-700 border-blue-200",
      ready: "bg-green-100 text-green-700 border-green-200",
      processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
      error: "bg-red-100 text-red-700 border-red-200",
    };
    return statusClasses[status as keyof typeof statusClasses] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          // Add to uploaded files
          const newPDF: UploadedPDF = {
            _id: `pdf${Date.now()}`,
            fileName: file.name,
            fileSize: (file.size / (1024 * 1024)).toFixed(2) + " MB",
            uploadDate: new Date().toISOString(),
            status: "processing",
          };
          setUploadedPDFs(prev => [...prev, newPDF]);
          setSelectedFile(null);
          setUploadProgress(0);
        }
      }, 200);
    }
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    // Here you would typically save to backend
  };

  // Navigation handlers
  const handleCreatePackage = () => {
    router.push('/create-package');
  };

  // Package action handlers
  const handleViewPackage = async (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowDetailModal(true);
  };

  const handleEditPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setEditFormData({
      title: pkg.title,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration,
      isPublished: pkg.isPublished
    });
    setShowEditModal(true);
  };

  const handleDeletePackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/packages/${selectedPackage._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete package');
      }

      // Remove package from state
      setPackages(prev => prev.filter(pkg => pkg._id !== selectedPackage._id));
      
      // Update creator profile stats
      if (creatorProfile) {
        setCreatorProfile(prev => prev ? {
          ...prev,
          totalPackages: prev.totalPackages - 1
        } : null);
      }
      
      toast.success('Package deleted successfully');
      setShowDeleteModal(false);
      setSelectedPackage(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete package';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    try {
      // Prepare update data, removing isPublished if user is not admin
      const updateData = { ...editFormData };
      if (userRole !== 'admin' && 'isPublished' in updateData) {
        delete updateData.isPublished;
      }

      const response = await fetch(`/api/packages/${selectedPackage._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update package');
      }

      const result = await response.json();
      
      // Update package in state
      setPackages(prev => prev.map(pkg => 
        pkg._id === selectedPackage._id 
          ? { ...pkg, ...updateData }
          : pkg
      ));
      
      toast.success('Package updated successfully');
      setShowEditModal(false);
      setSelectedPackage(null);
      setEditFormData({});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update package';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl shadow-sm p-6 border ${stat.borderColor} hover:shadow-md transition-shadow duration-200`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500">{stat.change}</p>
                    </div>
                    <div
                      className={`p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border`}
                    >
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-0 overflow-x-auto">
                {navigationTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6 lg:p-8">
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading packages...</span>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="text-red-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                      <button 
                        onClick={loadCreatorData}
                        className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Created Packages Tab */}
              {activeTab === "packages" && !loading && !error && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        My Packages
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Manage and monitor your educational packages
                      </p>
                    </div>
                    <button 
                      onClick={handleCreatePackage}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Package
                    </button>
                  </div>

                  {packages.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No packages yet</h3>
                      <p className="text-gray-600 mb-4">Start creating your first educational package</p>
                      <button 
                        onClick={handleCreatePackage}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Create Your First Package
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {packages.map((pkg) => (
                        <div
                          key={pkg._id}
                          className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {pkg.title}
                                </h4>
                                <span
                                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                                    pkg.isPublished ? "published" : "pending"
                                  )}`}
                                >
                                  {pkg.isPublished ? "Published" : "Draft"}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-4 leading-relaxed">
                                {pkg.description}
                              </p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="text-xs text-gray-500 block mb-1">
                                    Category
                                  </span>
                                  <p className="font-semibold text-gray-900">
                                    {pkg.categoryName || 'No Category'}
                                  </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="text-xs text-gray-500 block mb-1">
                                    Price
                                  </span>
                                  <p className="font-semibold text-gray-900">
                                    {formatCurrency(pkg.price)}
                                  </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="text-xs text-gray-500 block mb-1">
                                    Questions
                                  </span>
                                  <p className="font-semibold text-gray-900">
                                    {pkg.contents?.length || 0}
                                  </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="text-xs text-gray-500 block mb-1">
                                    Duration
                                  </span>
                                  <p className="font-semibold text-gray-900">
                                    {pkg.duration} min
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-6">
                              <button
                                onClick={() => handleViewPackage(pkg)}
                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleEditPackage(pkg)}
                                className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title="Edit Package"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeletePackage(pkg)}
                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Package"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Upload PDF Tab */}
              {activeTab === "uploads" && !loading && !error && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Upload Learning Materials
                    </h3>
                    <p className="text-gray-600">
                      Upload PDF files to enhance your packages with additional
                      materials
                    </p>
                  </div>

                  {/* Upload Area */}
                  <div className="bg-gray-50 rounded-xl p-8">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label htmlFor="pdf-upload" className="cursor-pointer">
                        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-gray-900 mb-2">
                          Upload PDF Files
                        </p>
                        <p className="text-gray-600 mb-2">
                          Drag and drop your PDF files here, or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                          Maximum file size: 10MB • Supported format: PDF
                        </p>
                      </label>
                    </div>

                    {/* Upload Progress */}
                    {selectedFile && uploadProgress > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-blue-900">
                            Uploading: {selectedFile.name}
                          </span>
                          <span className="text-sm font-semibold text-blue-600">
                            {uploadProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Uploaded Files List */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Uploaded Materials
                    </h4>
                    <div className="space-y-4">
                      {uploadedPDFs.map((pdf) => (
                        <div
                          key={pdf._id}
                          className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-red-100 rounded-lg">
                                <FileText className="w-6 h-6 text-red-600" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900">
                                  {pdf.fileName}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {pdf.fileSize} • Uploaded{" "}
                                  {new Date(pdf.uploadDate).toLocaleDateString(
                                    "id-ID"
                                  )}
                                </p>
                                {pdf.packageTitle && (
                                  <p className="text-sm text-blue-600 font-medium">
                                    📎 Linked to: {pdf.packageTitle}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                                  pdf.status
                                )}`}
                              >
                                {pdf.status}
                              </span>
                              <button
                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Package Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedPackage.title}</h4>
                <p className="text-gray-600 mt-2">{selectedPackage.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm text-gray-500">Price</span>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedPackage.price)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm text-gray-500">Duration</span>
                  <p className="text-lg font-semibold text-gray-900">{selectedPackage.duration} minutes</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm text-gray-500">Status</span>
                  <p className="text-lg font-semibold text-gray-900">{selectedPackage.isPublished ? 'Published' : 'Draft'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm text-gray-500">Questions</span>
                  <p className="text-lg font-semibold text-gray-900">{selectedPackage.contents?.length || 0}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500">Created Date</span>
                <p className="text-gray-900">{new Date(selectedPackage.createdAt).toLocaleDateString()}</p>
              </div>
              
              {selectedPackage.sourcePdf && selectedPackage.sourcePdf.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500">Source PDFs</span>
                  <div className="mt-2 space-y-2">
                    {selectedPackage.sourcePdf.map((pdf, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">PDF {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Edit Package</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input
                    type="number"
                    value={editFormData.price || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={editFormData.duration || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Only show publish status checkbox for admin users */}
              {userRole === 'admin' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={editFormData.isPublished || false}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                    Published
                  </label>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleEditSubmit}
                  disabled={isProcessing}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Package</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete "<strong>{selectedPackage.title}</strong>"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={confirmDelete}
                  disabled={isProcessing}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}

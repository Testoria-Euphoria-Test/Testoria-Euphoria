"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  FileText,
  Upload,
  Eye,
  Trash2,
  Plus,
  Users,
  DollarSign,
  Star,
  Download,
  RefreshCw,
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reuploadFile, setReuploadFile] = useState<File | null>(null);

  // AI Processing states
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);

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
  const handleDeletePackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowDeleteModal(true);
  };

  const handleReuploadPDF = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowReuploadModal(true);
  };

  const handleReuploadFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('File size must be less than 50MB');
        return;
      }
      setReuploadFile(file);
    }
  };

  const confirmReupload = async () => {
    if (!selectedPackage || !reuploadFile) return;
    
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', reuploadFile);

      const response = await fetch(`/api/packages/${selectedPackage._id}/reupload`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reupload PDF');
      }

      const result = await response.json();
      
      // Update package in state if needed
      setPackages(prev => prev.map(pkg => 
        pkg._id === selectedPackage._id 
          ? { ...pkg, sourcePdf: [result.data.newPdfUrl], pdfImages: result.data.pdfImagesGenerated, updatedAt: new Date() }
          : pkg
      ));
      
      toast.success(`PDF reuploaded successfully! Generated ${result.data.pdfImagesGenerated} page images.`);
      setShowReuploadModal(false);
      setSelectedPackage(null);
      setReuploadFile(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reupload PDF';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
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

  // AI Processing handlers
  const handleProcessAIAndGenerateQuestions = async (pkg: Package) => {
    setProcessingPackageId(pkg._id);
    try {
      // Step 1: Process AI content from PDFs
      const processResponse = await fetch(`/api/packages/${pkg._id}/process`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.message || 'Failed to process AI');
      }

      const processResult = await processResponse.json();
      
      // Step 2: Generate questions from processed content
      const questionsResponse = await fetch('/api/questions', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId: pkg._id })
      });

      if (!questionsResponse.ok) {
        const errorData = await questionsResponse.json();
        throw new Error(errorData.message || 'Failed to generate questions');
      }

      const questionsResult = await questionsResponse.json();
      
      toast.success(`AI processing completed! Found ${processResult.data.totalQuestions} content items and generated ${questionsResult.questionsCreated} questions`);
      
      // Reload packages to get updated content
      await loadCreatorData();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process AI and generate questions';
      toast.error(errorMessage);
    } finally {
      setProcessingPackageId(null);
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

                  {packages.length === 0 && (
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
                  )}
                  
                  {packages.length > 0 && (
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
                                    AI Content
                                  </span>
                                  <p className="font-semibold text-gray-900">
                                    {pkg.contents?.length || 0} items
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

                              {/* Workflow Status Indicator */}
                              <div className="mt-4 flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-xs text-gray-600">PDF Uploaded</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${pkg.contents && pkg.contents.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                  <span className="text-xs text-gray-600">AI Processed</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                  <span className="text-xs text-gray-600">Questions Generated</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-6">
                              {/* AI Processing & Generate Questions Button */}
                              <button
                                onClick={() => handleProcessAIAndGenerateQuestions(pkg)}
                                disabled={processingPackageId === pkg._id}
                                className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Process AI and Generate Questions"
                              >
                                {processingPackageId === pkg._id ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                  </svg>
                                )}
                              </button>

                              {/* Reupload PDF Button */}
                              <button
                                onClick={() => handleReuploadPDF(pkg)}
                                className="text-orange-600 hover:text-orange-900 p-2 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Reupload PDF"
                              >
                                <RefreshCw className="w-5 h-5" />
                              </button>

                              <button
                                onClick={() => router.push(`/package-detail/${pkg._id}`)}
                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details & Edit"
                              >
                                <Eye className="w-5 h-5" />
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

      {/* Reupload PDF Modal */}
      {showReuploadModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reupload PDF
              </h3>
              <p className="text-gray-600">
                Replace the PDF file for "{selectedPackage.title}". This will clear existing processed content.
              </p>
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New PDF File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 hover:bg-orange-50 transition-all">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleReuploadFileChange}
                  className="hidden"
                  id="reupload-file"
                />
                <label htmlFor="reupload-file" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {reuploadFile ? reuploadFile.name : 'Click to select PDF file'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Max 50MB • PDF format only
                  </p>
                  {reuploadFile && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {(reuploadFile.size / (1024 * 1024)).toFixed(2)}MB selected
                    </p>
                  )}
                </label>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Important Notice
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>This will replace the current PDF file</li>
                      <li>All existing AI processed content will be cleared</li>
                      <li>You'll need to run AI processing again after upload</li>
                      <li>Questions created from the old PDF will remain until you regenerate them</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={confirmReupload}
                disabled={isProcessing || !reuploadFile}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Uploading...' : 'Reupload PDF'}
              </button>
              <button
                onClick={() => {
                  setShowReuploadModal(false);
                  setSelectedPackage(null);
                  setReuploadFile(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}

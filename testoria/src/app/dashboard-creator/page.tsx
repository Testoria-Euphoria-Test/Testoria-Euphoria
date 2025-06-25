"use client";

import { useState } from "react";
import {
  User,
  Package,
  FileText,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  Settings,
  Download,
  FileUp,
  Save,
  X,
  Check,
  Activity,
  Bell,
  Menu,
} from "lucide-react";

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
  category: string;
  price: number;
  duration: number;
  totalQuestions: number;
  students: number;
  rating: number;
  status:  "pending" | "published";
  createdAt: string;
  updatedAt: string;
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
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock data for creator profile
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile>({
    _id: "creator1",
    name: "Dr. Ahmad Susanto",
    email: "ahmad@testoria.com",
    education: "S3 Pendidikan Matematika, Universitas Indonesia",
    certificates: [
      "Sertifikat Pengajar Matematika",
      "Sertifikat UTBK Preparation Expert",
      "Certified Educational Content Creator"
    ],
    bio: "Pengajar berpengalaman 15 tahun dalam persiapan UTBK dan olimpiade matematika. Telah membantu ribuan siswa mencapai universitas impian mereka.",
    totalPackages: 8,
    totalStudents: 3420,
    totalEarnings: 125000000,
    rating: 4.9,
    joinDate: "2023-01-15",
  });

  // Mock data for packages created by creator
  const [packages, setPackages] = useState<Package[]>([
    {
      _id: "pkg1",
      title: "UTBK Saintek 2024 - Matematika Dasar",
      description:
        "Paket lengkap persiapan UTBK Saintek dengan fokus pada matematika dasar dan penalaran",
      category: "UTBK",
      price: 199000,
      duration: 180,
      totalQuestions: 150,
      students: 1250,
      rating: 4.8,
      status: "published",
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      _id: "pkg2",
      title: "UTBK Soshum 2024 - Ekonomi & Geografi",
      description:
        "Try out UTBK Soshum dengan strategi khusus untuk ekonomi dan geografi",
      category: "UTBK",
      price: 179000,
      duration: 180,
      totalQuestions: 120,
      students: 980,
      rating: 4.9,
      status: "published",
      createdAt: "2024-02-15T10:00:00Z",
      updatedAt: "2024-02-20T10:00:00Z",
    },
    {
      _id: "pkg3",
      title: "Matematika Olimpiade SMA",
      description:
        "Persiapan olimpiade matematika tingkat SMA dengan soal-soal challenging",
      category: "Olimpiade",
      price: 249000,
      duration: 240,
      totalQuestions: 80,
      students: 145,
      rating: 5.0,
      status: "pending",
      createdAt: "2024-03-01T10:00:00Z",
      updatedAt: "2024-03-05T10:00:00Z",
    },
    {
      _id: "pkg4",
      title: "SNBT 2024 - Penalaran Matematika",
      description:
        "Simulasi SNBT dengan fokus pada penalaran matematika dan logika",
      category: "SNBT",
      price: 189000,
      duration: 195,
      totalQuestions: 100,
      students: 0,
      rating: 0,
      status: "pending",
      createdAt: "2024-03-10T10:00:00Z",
      updatedAt: "2024-03-12T10:00:00Z",
    },
  ]);

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

  const stats = [
    {
      label: "Total Packages",
      value: creatorProfile.totalPackages.toString(),
      change: "+2 this month",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      label: "Total Students",
      value: creatorProfile.totalStudents.toLocaleString(),
      change: "+15% this month",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      label: "Total Earnings",
      value: (creatorProfile.totalEarnings),
      change: "+28% this month",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      label: "Average Rating",
      value: creatorProfile.rating.toString(),
      change: "4.9/5.0 stars",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
  ];

  const navigationTabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "profile", label: "Profile Info", icon: User },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Creator Dashboard</h1>
                <p className="text-sm text-gray-500 hidden sm:block">Welcome back, {creatorProfile.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {creatorProfile.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
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
                className={`bg-white rounded-xl shadow-sm p-6 border ${stat.borderColor} hover:shadow-md transition-shadow duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border`}>
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
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Create New Package</span>
                  </button>
                  <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2">
                    <FileUp className="w-5 h-5" />
                    <span className="font-medium">Upload Materials</span>
                  </button>
                  <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-medium">View Analytics</span>
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Recent Activity */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                      <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-blue-100">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">New package created</p>
                          <p className="text-sm text-gray-600">SNBT 2024 - Penalaran Matematika</p>
                          <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-green-100">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">50+ new enrollments</p>
                          <p className="text-sm text-gray-600">UTBK Saintek 2024 - Matematika Dasar</p>
                          <p className="text-xs text-gray-500 mt-1">1 week ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-purple-100">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Earnings milestone</p>
                          <p className="text-sm text-gray-600">Reached Rp 125,000,000 total earnings</p>
                          <p className="text-xs text-gray-500 mt-1">2 weeks ago</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Overview */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
                      <TrendingUp className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="bg-white rounded-lg p-8 h-64 flex items-center justify-center border border-gray-200">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Performance Chart</p>
                        <p className="text-sm text-gray-400">Analytics will be displayed here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Info Tab */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
                    <p className="text-gray-600 mt-1">Manage your personal information and credentials</p>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      isEditingProfile 
                        ? "text-red-600 hover:bg-red-50 border border-red-200" 
                        : "text-blue-600 hover:bg-blue-50 border border-blue-200"
                    }`}
                  >
                    {isEditingProfile ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                    {isEditingProfile ? "Cancel Edit" : "Edit Profile"}
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 lg:p-8">
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            value={creatorProfile.name}
                            onChange={(e) => setCreatorProfile({...creatorProfile, name: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium bg-white p-4 rounded-lg border">{creatorProfile.name}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
                        <p className="text-gray-900 font-medium bg-white p-4 rounded-lg border">{creatorProfile.email}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Education Background</label>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            value={creatorProfile.education}
                            onChange={(e) => setCreatorProfile({...creatorProfile, education: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium bg-white p-4 rounded-lg border">{creatorProfile.education}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Join Date</label>
                        <p className="text-gray-900 font-medium bg-white p-4 rounded-lg border">
                          {new Date(creatorProfile.joinDate).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Professional Bio</label>
                        {isEditingProfile ? (
                          <textarea
                            value={creatorProfile.bio}
                            onChange={(e) => setCreatorProfile({...creatorProfile, bio: e.target.value})}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium bg-white p-4 rounded-lg border leading-relaxed">{creatorProfile.bio}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Certificates & Credentials</label>
                        <div className="space-y-3">
                          {creatorProfile.certificates.map((cert, index) => (
                            <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded-lg border">
                              <div className="p-1 bg-green-100 rounded-full">
                                <Check className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="text-gray-900 font-medium">{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isEditingProfile && (
                    <div className="flex justify-end mt-8 space-x-4">
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Created Packages Tab */}
            {activeTab === "packages" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">My Packages</h3>
                    <p className="text-gray-600 mt-1">Manage and monitor your educational packages</p>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Package
                  </button>
                </div>

                <div className="grid gap-6">
                  {packages.map((pkg) => (
                    <div key={pkg._id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="text-lg font-semibold text-gray-900">{pkg.title}</h4>
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(pkg.status)}`}>
                              {pkg.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4 leading-relaxed">{pkg.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-3 rounded-lg border">
                              <span className="text-xs text-gray-500 block mb-1">Category</span>
                              <p className="font-semibold text-gray-900">{pkg.category}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <span className="text-xs text-gray-500 block mb-1">Price</span>
                              <p className="font-semibold text-gray-900">{(pkg.price)}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <span className="text-xs text-gray-500 block mb-1">Students</span>
                              <p className="font-semibold text-gray-900">{pkg.students.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <span className="text-xs text-gray-500 block mb-1">Rating</span>
                              <p className="font-semibold text-gray-900 flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                {pkg.rating > 0 ? pkg.rating : "No ratings"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-6">
                          <button className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors" title="Edit Package">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete Package">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload PDF Tab */}
            {activeTab === "uploads" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Learning Materials</h3>
                  <p className="text-gray-600">Upload PDF files to enhance your packages with additional materials</p>
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
                      <p className="text-xl font-semibold text-gray-900 mb-2">Upload PDF Files</p>
                      <p className="text-gray-600 mb-2">Drag and drop your PDF files here, or click to browse</p>
                      <p className="text-sm text-gray-500">Maximum file size: 10MB • Supported format: PDF</p>
                    </label>
                  </div>

                  {/* Upload Progress */}
                  {selectedFile && uploadProgress > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-blue-900">Uploading: {selectedFile.name}</span>
                        <span className="text-sm font-semibold text-blue-600">{uploadProgress}%</span>
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
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Materials</h4>
                  <div className="space-y-4">
                    {uploadedPDFs.map((pdf) => (
                      <div key={pdf._id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-red-100 rounded-lg">
                              <FileText className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">{pdf.fileName}</h5>
                              <p className="text-sm text-gray-600">{pdf.fileSize} • Uploaded {new Date(pdf.uploadDate).toLocaleDateString('id-ID')}</p>
                              {pdf.packageTitle && (
                                <p className="text-sm text-blue-600 font-medium">📎 Linked to: {pdf.packageTitle}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(pdf.status)}`}>
                              {pdf.status}
                            </span>
                            <button className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
  );
}
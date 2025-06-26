import {
  Clock,
  Calendar,
  User,
  Star,
  Users,
  BookOpen,
  Award,
  PlayCircle,
  ShoppingCart,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Categories {
  _id: string;
  name: string;
}

interface Packages {
  _id: string;
  title: string;
  categoryId: string;
  creatorId: string;
  duration: number; // in minutes
  description: string;
  createdAt: Date;
  price: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  studentsEnrolled: number;
  totalQuestions: number;
  includes: string[];
  features: string[];
}

interface Profiles {
  _id: string;
  userId: string;
  education: string;
  certificates: string[];
  bio: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "customer" | "creator";
  avatar?: string;
}

// Mock data for demonstration
const mockPackages: Packages[] = [
  {
    _id: "pkg1",
    title: "UTBK Saintek 2024 - Matematika Dasar & Penalaran Logika",
    categoryId: "cat1",
    creatorId: "creator1",
    duration: 180,
    description:
      "Paket persiapan lengkap UTBK Saintek dengan fokus pada matematika dasar, penalaran logika, dan strategi mengerjakan soal. Dilengkapi dengan simulasi ujian yang realistis dan pembahasan detail dari instruktur berpengalaman.",
    createdAt: new Date("2024-01-10"),
    price: 299000,
    level: "Intermediate",
    rating: 4.8,
    studentsEnrolled: 15420,
    totalQuestions: 200,
    includes: [
      "200+ Soal Latihan Berkualitas",
      "10 Simulasi Ujian Lengkap",
      "Video Pembahasan Detail",
      "E-book Materi Lengkap",
      "Akses Selamanya",
      "Sertifikat Completion",
    ],
    features: [
      "Adaptive Learning System",
      "Progress Tracking",
      "Discussion Forum",
      "Mobile App Access",
      "Offline Download",
      "Expert Support",
    ],
  },
  {
    _id: "pkg2",
    title: "CPNS 2024 - Tes Wawasan Kebangsaan",
    categoryId: "cat2",
    creatorId: "creator2",
    duration: 90,
    description:
      "Persiapan komprehensif CPNS dengan fokus pada TWK dan materi terbaru sesuai kisi-kisi resmi. Berisi soal-soal prediksi yang akurat dan strategi khusus menghadapi tes CPNS.",
    createdAt: new Date("2024-02-15"),
    price: 199000,
    level: "Beginner",
    rating: 4.6,
    studentsEnrolled: 8730,
    totalQuestions: 150,
    includes: [
      "150+ Soal TWK Terbaru",
      "8 Simulasi Ujian",
      "Materi Lengkap TWK",
      "Tips & Trik Khusus",
      "Update Materi Berkala",
      "Konsultasi Gratis",
    ],
    features: [
      "Bank Soal Terupdate",
      "Analisis Performa",
      "Study Plan Personal",
      "Live Session Rutin",
      "Community Support",
    ],
  },
];

const mockCategories: Categories[] = [
  { _id: "cat1", name: "UTBK" },
  { _id: "cat2", name: "CPNS" },
  { _id: "cat3", name: "SNBT" },
];

const mockUsers: User[] = [
  {
    _id: "creator1",
    name: "Dr. Ahmad Susanto, M.Pd",
    email: "ahmad@testoria.com",
    role: "creator",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    _id: "creator2",
    name: "Drs. Bambang Wijaya, M.Si",
    email: "bambang@testoria.com",
    role: "creator",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
];

const mockProfiles: Profiles[] = [
  {
    _id: "prof1",
    userId: "creator1",
    education: "S3 Pendidikan Matematika - Universitas Indonesia",
    certificates: [
      "Sertifikat Instruktur UTBK Nasional",
      "TOEFL Score 580",
      "Microsoft Certified Educator",
    ],
    bio: "Pengajar matematika dengan pengalaman 15+ tahun. Telah membimbing lebih dari 10,000 siswa lolos UTBK dan PTN favorit. Spesialis dalam mengembangkan metode pembelajaran yang efektif dan menyenangkan.",
    createdAt: new Date("2020-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    _id: "prof2",
    userId: "creator2",
    education: "S2 Administrasi Publik - Universitas Gadjah Mada",
    certificates: [
      "Sertifikat CPNS Trainer Profesional",
      "Certified Public Administrator",
      "Training of Trainer Certificate",
    ],
    bio: "Praktisi dan pengajar bidang administrasi publik dengan pengalaman 12 tahun. Ahli dalam persiapan tes CPNS dan telah membantu ribuan peserta lolos seleksi CPNS di berbagai instansi.",
    createdAt: new Date("2021-03-10"),
    updatedAt: new Date("2024-02-20"),
  },
];

export default async function PackagePageDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Find package by id
  const packageData = mockPackages.find((pkg) => pkg._id === id);

  if (!packageData) {
    notFound();
  }

  // Get related data
  const category = mockCategories.find(
    (cat) => cat._id === packageData.categoryId
  );
  const creator = mockUsers.find((user) => user._id === packageData.creatorId);
  const profile = mockProfiles.find(
    (prof) => prof.userId === packageData.creatorId
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/packages"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Packages
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Package Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full border border-white/30">
                    {category?.name}
                  </span>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full border ${getLevelColor(
                      packageData.level
                    )} bg-white`}
                  >
                    {packageData.level}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
                  {packageData.title}
                </h1>

                <p className="text-blue-100 text-lg leading-relaxed mb-6">
                  {packageData.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center text-white/80 mb-1">
                      <Star className="w-4 h-4 mr-1 text-yellow-300 fill-current" />
                      <span className="text-sm">Rating</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                      {packageData.rating}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center text-white/80 mb-1">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">Students</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                      {packageData.studentsEnrolled.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center text-white/80 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                      {packageData.duration} min
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center text-white/80 mb-1">
                      <BookOpen className="w-4 h-4 mr-1" />
                      <span className="text-sm">Questions</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                      {packageData.totalQuestions}
                    </p>
                  </div>
                </div>
              </div>
            </div>


         
            {/* Instructor */}
            {creator && profile && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <User className="w-6 h-6 mr-3 text-purple-600" />
                  Meet Your Instructor
                </h2>

                <div className="flex items-start space-x-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                    {creator.avatar ? (
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="text-white text-2xl font-bold">
                        {creator.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {creator.name}
                    </h3>
                    <p className="text-blue-600 font-semibold mb-3 flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      {profile.education}
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {profile.bio}
                    </p>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Certificates & Qualifications:
                      </h4>
                      <div className="space-y-1">
                        {profile.certificates.map((cert, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <Award className="w-4 h-4 mr-2 text-yellow-500" />
                            {cert}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Purchase Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {formatPrice(packageData.price)}
                  </div>
                  <p className="text-gray-600">
                    One-time payment • Lifetime access
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg transform hover:scale-105 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Enroll Now
                  </button>

                  <button className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Preview Course
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Quick Info:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level</span>
                      <span className="font-medium">{packageData.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">
                        {packageData.duration} minutes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Questions</span>
                      <span className="font-medium">
                        {packageData.totalQuestions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certificate</span>
                      <span className="font-medium">✓ Included</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Access</span>
                      <span className="font-medium">Lifetime</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Course Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <p className="font-medium">
                      {formatDate(packageData.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <p className="font-medium">{category?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Language:</span>
                    <p className="font-medium">Bahasa Indonesia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

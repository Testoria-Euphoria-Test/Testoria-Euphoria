"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Calendar,
  GraduationCap,
  Award,
  Edit3,
  MapPin,
  Phone,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "customer" | "creator";
  createdAt: Date;
  updatedAt: Date;
}

interface Profile {
  _id: string;
  userId: string;
  education: string;
  certificates: string[];
  bio: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data
const mockUser: User = {
  _id: "user1",
  name: "Dr. Ahmad Susanto, M.Pd",
  email: "ahmad.susanto@testoria.com",
  role: "creator",
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2024-06-25"),
};

const mockProfile: Profile = {
  _id: "profile1",
  userId: "user1",
  education: "S3 Pendidikan Matematika - Universitas Indonesia",
  certificates: [
    "Sertifikat Instruktur UTBK Nasional",
    "TOEFL Score 580",
    "Microsoft Certified Educator",
    "Certified Mathematics Teacher",
  ],
  bio: "Pengajar matematika dengan pengalaman 15+ tahun dalam bidang pendidikan. Telah membimbing lebih dari 10,000 siswa untuk lolos UTBK dan diterima di PTN favorit. Spesialis dalam mengembangkan metode pembelajaran yang efektif dan menyenangkan. Aktif dalam penelitian pendidikan matematika dan pengembangan kurikulum.",
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2024-06-20"),
};


export default function ProfilePage() {
  const [user] = useState<User>(mockUser);
  const [profile] = useState<Profile>(mockProfile);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getRoleConfig = (role: string) => {
    switch (role) {
      case "admin":
        return {
          bg: "bg-red-100 text-red-800",
          icon: "👑",
          title: "Administrator",
          color: "text-red-600",
        };
      case "creator":
        return {
          bg: "bg-blue-100 text-blue-800",
          icon: "🎓",
          title: "Course Creator",
          color: "text-blue-600",
        };
      case "customer":
        return {
          bg: "bg-green-100 text-green-800",
          icon: "📚",
          title: "Student",
          color: "text-green-600",
        };
      default:
        return {
          bg: "bg-gray-100 text-gray-800",
          icon: "👤",
          title: "User",
          color: "text-gray-600",
        };
    }
  };

  const roleConfig = getRoleConfig(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-center">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-blue-600">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {user.name}
                </h2>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleConfig.bg}`}
                >
                  <span className="mr-1">{roleConfig.icon}</span>
                  {roleConfig.title}
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-3 text-blue-500" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm">+62 812 3456 7890</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-red-500" />
                  <span className="text-sm">Jakarta, Indonesia</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-purple-500" />
                  <span className="text-sm">
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              {/* Bio Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <User className="w-6 h-6 mr-3 text-blue-600" />
                    Summary
                  </h3>
                  <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                    <Edit3 className="w-5 h-5 mr-2" />
                    Edit Profile
                  </button>
                </div>
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {profile.bio}
                  </p>
                </div>
              </div>

              {/* Education Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="w-6 h-6 mr-3 text-purple-600" />
                  Education Background
                </h3>
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-start">
                    <div className="w-4 h-4 bg-purple-500 rounded-full mt-1 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">
                        Higher Education
                      </h4>
                      <p className="text-gray-700 font-medium text-lg">
                        {profile.education}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificates Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="w-6 h-6 mr-3 text-yellow-600" />
                  Certifications & Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.certificates.map((cert, index) => (
                    <div
                      key={index}
                      className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Certificate
                          </h4>
                          <p className="text-gray-700 font-medium">{cert}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

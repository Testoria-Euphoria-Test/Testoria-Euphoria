import { Mail, Calendar, Award, ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Image from "next/image";

interface ProfileData {
  id: string;
  bio?: string;
  education?: string;
  certificates?: string[];
  photoUrl?: string;
  createdAt: string;
  user?: {
    id: string;
    name?: string;
    email: string;
    role?: string;
    createdAt: string;
  };
}

export default async function ProfileCreator({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let profileData: ProfileData;

  try {
    const data = await fetch(`http://localhost:3000/api/profiles/${id}`);
    const res = await data.json();

    if (!res.success || !res.data) {
      throw new Error('Profile not found');
    }

    profileData = res.data;
  } catch (error) {
    // Return error page if profile fetch fails
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">Profil tidak ditemukan</p>
            <Link
              href="/dashboard-customer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Helper function untuk format tanggal
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function untuk get initials jika tidak ada foto
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "CR";
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <div className="border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/dashboard-customer"
              className="inline-flex items-center text-white  transition-colors bg-blue-600 p-1.5 rounded-2xl font-bold"
            >
              <ArrowLeft className="w-5 h-5 mr-2 " />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Cover Background */}
                <div className="h-40 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative"></div>
              </div>

              {/* Profile Info */}
              <div className="relative px-6 pb-6">
                {/* Profile Picture */}
                <div className="absolute -top-20 left-6">
                  {profileData?.photoUrl && profileData.photoUrl.trim() !== "" ? (
                    <div className="relative w-32 h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden">
                      <Image
                        src={profileData.photoUrl}
                        alt="Profile"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">
                        {getInitials(
                          profileData?.user?.name,
                          profileData?.user?.email
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="pt-16">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {profileData?.user?.name ||
                          profileData?.user?.email?.split("@")[0] ||
                          "Creator"}
                      </h1>
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                          {profileData?.user?.role || "Creator"}
                        </span>
                        <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-full flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Email
                        </p>
                        <p className="font-semibold text-gray-900">
                          {profileData?.user?.email || "Not available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Joined
                        </p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(
                            profileData?.user?.createdAt || profileData?.createdAt || new Date().toISOString()
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {profileData?.bio && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-6 bg-blue-600 rounded-full mr-3"></div>
                        About
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {profileData.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Education & Certificates */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                Education & Certifications
              </h2>

              {/* Education */}
              {profileData?.education && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Education
                  </h3>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-blue-900 text-lg">
                          {profileData.education}
                        </p>
                        <p className="text-sm text-blue-600 font-medium">
                          Educational Background
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Certificates */}
              {profileData?.certificates &&
                profileData.certificates.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Certificates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.certificates.map((cert, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Award className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-green-900 truncate">
                                {cert}
                              </p>
                              <p className="text-sm text-green-600 font-medium">
                                Certified
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Jika tidak ada education atau certificates */}
              {!profileData?.education &&
                (!profileData?.certificates ||
                  profileData.certificates.length === 0) && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">
                      No education or certification information available
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

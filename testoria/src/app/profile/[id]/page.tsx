"use client";

import { Mail, Calendar, Award, ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

export default function ProfileCreator({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [id, setId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Check auth status
        const authResponse = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        setIsLoggedIn(authResponse.ok);

        // Fetch profile data
        const data = await fetch(`/api/profiles/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!data.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const res = await data.json();

        if (!res.success || !res.data) {
          throw new Error('Profile not found');
        }

        setProfileData(res.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Navbar showUserActions={false} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    // Return error page if profile fetch fails
    return (
      <div>
        <Navbar showUserActions={isLoggedIn} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">Profil tidak ditemukan</p>
            <Link
              href={isLoggedIn ? "/dashboard-customer" : "/"}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {isLoggedIn ? "Kembali ke Dashboard" : "Kembali ke Beranda"}
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

  // Helper function to validate if string is a valid URL
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Helper function to validate if string is a valid image URL
  const isValidImageUrl = (url: string) => {
    if (!isValidUrl(url)) return false;
    // Check if it's a valid image URL (http/https)
    return url.startsWith('http://') || url.startsWith('https://');
  };

  return (
    <div>
      <Navbar showUserActions={isLoggedIn} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <div className="border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href={isLoggedIn ? "/dashboard-customer" : "/"}
              className="inline-flex items-center text-white  transition-colors bg-blue-600 p-1.5 rounded-2xl font-bold"
            >
              <ArrowLeft className="w-5 h-5 mr-2 " />
              {isLoggedIn ? "Kembali ke Dashboard" : "Kembali ke Beranda"}
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Main Profile Card */}
            <div className="lg:col-span-3 space-y-6">
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
                          Terverifikasi
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
                          {profileData?.user?.email || "Tidak tersedia"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Bergabung
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
                        Tentang
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
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                Pendidikan & Sertifikasi
              </h2>

              {/* Education */}
              {profileData?.education && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Pendidikan
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
                          Latar Belakang Pendidikan
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Certificates */}
              {profileData?.certificates &&
                profileData.certificates.length > 0 &&
                profileData.certificates.filter(cert => isValidImageUrl(cert)).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Award className="w-5 h-5 text-green-600 mr-2" />
                      Sertifikat ({profileData.certificates.filter(cert => isValidImageUrl(cert)).length})
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {profileData.certificates
                        .filter(cert => isValidImageUrl(cert)) // Only show valid URLs
                        .map((cert, index) => (
                        <div
                          key={index}
                          className="group bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => window.open(cert, '_blank')}
                        >
                          <div className="flex flex-col space-y-3">
                            {/* Certificate Image */}
                            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-white border border-green-100">
                              <Image
                                src={cert}
                                alt={`Sertifikat ${index + 1}`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-full h-full flex items-center justify-center bg-gray-100">
                                        <div class="text-center">
                                          <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                          </svg>
                                          <p class="text-sm text-gray-500">Sertifikat ${index + 1}</p>
                                        </div>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                            </div>
                            
                            {/* Certificate Info */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Award className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-green-900">
                                    Sertifikat {index + 1}
                                  </p>
                                  <p className="text-sm text-green-600">
                                    Klik untuk melihat detail
                                  </p>
                                </div>
                              </div>
                              <div className="text-green-600 group-hover:text-green-700 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
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
                  profileData.certificates.length === 0 ||
                  profileData.certificates.filter(cert => isValidImageUrl(cert)).length === 0) && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">
                      Tidak ada informasi pendidikan atau sertifikasi yang tersedia
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

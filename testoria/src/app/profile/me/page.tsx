"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileType } from "../../../types/profile";
import {
  User,
  Mail,
  GraduationCap,
  Award,
  Edit,
  Calendar,
  Settings,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

interface ApiResponse {
  success: boolean;
  message: string;
  data: ProfileType;
}

export default function MyProfilePage() {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/profiles/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch profile");
        }

        const data: ApiResponse = await response.json();
        console.log("Profile data:", data);

        if (data.success) {
          setProfile(data.data);
        } else {
          setError(data.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "An error occurred");

        if (err instanceof Error && err.message.includes("authentication")) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Simple Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>

          {profile ? (
            <div className="space-y-6">
              {/* Main Profile Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start space-x-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                      {profile.photoUrl ? (
                        <Image
                          src={profile.photoUrl}
                          alt="Profile"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {profile.user?.name ||
                        profile.user?.email?.split("@")[0] ||
                        "User"}
                    </h2>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {profile.user?.email || "No email"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 capitalize">
                        {profile.user?.role || "customer"}
                      </span>
                      <span className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {profile.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/edit-profile/${profile._id}`}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* About */}
                <div className="bg-white rounded-lg shadow-sm border p-5">
                  <div className="flex items-center mb-3">
                    <User className="w-4 h-4 text-blue-600 mr-2" />
                    <h3 className="font-medium text-gray-900">About</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {profile.bio || "No bio available."}
                  </p>
                </div>

                {/* Education */}
                <div className="bg-white rounded-lg shadow-sm border p-5">
                  <div className="flex items-center mb-3">
                    <GraduationCap className="w-4 h-4 text-green-600 mr-2" />
                    <h3 className="font-medium text-gray-900">Education</h3>
                  </div>
                  <p className="text-sm text-gray-700">
                    {profile.education || "No education information."}
                  </p>
                </div>

                {/* Certificates */}
                <div className="bg-white rounded-lg shadow-sm border p-5 md:col-span-2">
                  <div className="flex items-center mb-3">
                    <Award className="w-4 h-4 text-yellow-600 mr-2" />
                    <h3 className="font-medium text-gray-900">
                      Certificates ({profile.certificates?.length || 0})
                    </h3>
                  </div>
                  {profile.certificates && profile.certificates.length > 0 ? (
                    <div className="space-y-2">
                      {profile.certificates.map((cert, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-yellow-50 rounded border-l-4 border-yellow-400"
                        >
                          <Award className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{cert}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No certificates added yet.
                    </p>
                  )}
                </div>

                {/* Quick Info */}
                <div className="bg-white rounded-lg shadow-sm border p-5 md:col-span-2">
                  <h3 className="font-medium text-gray-900 mb-3">Quick Info</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Role</span>
                      <p className="font-medium capitalize">
                        {profile.user?.role || "customer"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Certificates</span>
                      <p className="font-medium">
                        {profile.certificates?.length || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Profile ID</span>
                      <p className="font-mono text-xs">{profile._id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Updated</span>
                      <p className="text-xs">
                        {profile.updatedAt
                          ? new Date(profile.updatedAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-4">
                <Link
                  href="/dashboard-customer"
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Profile Found
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Create a profile to get started.
              </p>
              <Link
                href="/edit-profile/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                Create Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
    );
    }

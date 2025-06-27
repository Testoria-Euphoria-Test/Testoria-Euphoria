"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProfileType } from "../../../types/profile";
import {
  User,
  Mail,
  GraduationCap,
  Award,
  Edit,
  Calendar,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import Navbar from "../../../components/Navbar";

interface ApiResponse {
  success: boolean;
  message: string;
  data: ProfileType;
}

export default function MyProfilePage() {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // Form states
  const [formData, setFormData] = useState({
    photoUrl: "",
    education: "",
    bio: "",
    certificates: [""],
  });

  const fetchProfile = useCallback(async () => {
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

      if (data.success && data.data) {
        setProfile(data.data);
        setFormData({
          photoUrl: data.data.photoUrl || "",
          education: data.data.education || "",
          bio: data.data.bio || "",
          certificates:
            data.data.certificates?.length > 0 ? data.data.certificates : [""],
        });
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
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async () => {
    // Validation
    if (formData.photoUrl && !/^https?:\/\/.+/.test(formData.photoUrl)) {
      toast.error("Please enter a valid photo URL");
      return;
    }

    if (formData.education.length > 200) {
      toast.error("Education description is too long (max 200 characters)");
      return;
    }

    if (formData.bio.length > 500) {
      toast.error("Bio is too long (max 500 characters)");
      return;
    }

    try {
      setSaving(true);

      // Filter out empty certificates
      const cleanCertificates = formData.certificates.filter(
        (cert) => cert.trim() !== ""
      );

      const updateData = {
        photoUrl: formData.photoUrl.trim(),
        education: formData.education.trim(),
        bio: formData.bio.trim(),
        certificates: cleanCertificates,
      };

      const response = await fetch("/api/profiles/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        await fetchProfile(); // Refresh profile data
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCertificateChange = (index: number, value: string) => {
    const newCertificates = [...formData.certificates];
    newCertificates[index] = value;
    setFormData({ ...formData, certificates: newCertificates });
  };

  const addCertificate = () => {
    if (formData.certificates.length < 10) {
      setFormData({
        ...formData,
        certificates: [...formData.certificates, ""],
      });
    } else {
      toast.error("Maximum 10 certificates allowed");
    }
  };

  const removeCertificate = (index: number) => {
    const newCertificates = formData.certificates.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      certificates: newCertificates.length > 0 ? newCertificates : [""],
    });
  };

  const cancelEdit = () => {
    if (profile) {
      setFormData({
        photoUrl: profile.photoUrl || "",
        education: profile.education || "",
        bio: profile.bio || "",
        certificates:
          profile.certificates?.length > 0 ? profile.certificates : [""],
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center max-w-md">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-slate-600 mb-4 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-md"
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
            {profile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          {profile ? (
            <div className="space-y-6">
              {/* Main Profile Card */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-start space-x-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 ring-4 ring-white shadow-lg">
                      {(isEditing ? formData.photoUrl : profile.photoUrl) ? (
                        <Image
                          src={
                            isEditing
                              ? formData.photoUrl
                              : profile.photoUrl || ""
                          }
                          alt="Profile"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="mt-3">
                        <input
                          type="url"
                          value={formData.photoUrl}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              photoUrl: e.target.value,
                            })
                          }
                          placeholder="Photo URL"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                        />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900 mb-1">
                      {profile.user?.name ||
                        profile.user?.email?.split("@")[0] ||
                        "User"}
                    </h2>
                    <div className="flex items-center text-slate-600 mb-2">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {profile.user?.email || "No email"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 capitalize font-medium">
                        {profile.user?.role || "customer"}
                      </span>
                      <span className="flex items-center text-xs text-slate-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {profile.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isEditing && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="inline-flex items-center px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        ) : (
                          <Save className="w-4 h-4 mr-1" />
                        )}
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-all duration-200 shadow-md"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* About */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5">
                  <div className="flex items-center mb-3">
                    <User className="w-4 h-4 text-indigo-600 mr-2" />
                    <h3 className="font-medium text-slate-900">About</h3>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Tell us about yourself..."
                      className="w-full text-gray-600 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows={4}
                      maxLength={500}
                    />
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {profile.bio || "No bio available."}
                    </p>
                  )}
                  {isEditing && (
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  )}
                </div>

                {/* Education */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5">
                  <div className="flex items-center mb-3">
                    <GraduationCap className="w-4 h-4 text-emerald-600 mr-2" />
                    <h3 className="font-medium text-slate-900">Education</h3>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={formData.education}
                      onChange={(e) =>
                        setFormData({ ...formData, education: e.target.value })
                      }
                      placeholder="Your education background..."
                      className="w-full text-gray-600  px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows={4}
                      maxLength={200}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">
                      {profile.education || "No education information."}
                    </p>
                  )}
                  {isEditing && (
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.education.length}/200 characters
                    </p>
                  )}
                </div>

                {/* Certificates */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5 md:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-amber-600 mr-2" />
                      <h3 className="font-medium text-slate-900">
                        Certificates (
                        {isEditing
                          ? formData.certificates.filter((c) => c.trim()).length
                          : profile.certificates?.length || 0}
                        )
                      </h3>
                    </div>
                    {isEditing && (
                      <button
                        onClick={addCertificate}
                        className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs hover:bg-indigo-200 transition-all duration-200"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      {formData.certificates.map((cert, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="text"
                            value={cert}
                            onChange={(e) =>
                              handleCertificateChange(index, e.target.value)
                            }
                            placeholder="Certificate name or URL"
                            className="flex-1 px-3 text-gray-600  py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {formData.certificates.length > 1 && (
                            <button
                              onClick={() => removeCertificate(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {profile.certificates &&
                      profile.certificates.length > 0 ? (
                        <div className="space-y-2">
                          {profile.certificates.map((cert, index) => (
                            <div
                              key={index}
                              className="flex items-center p-3 bg-yellow-50 rounded border-l-4 border-yellow-400"
                            >
                              <Award className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                {cert}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No certificates added yet.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {!isEditing && (
                <div className="flex justify-center space-x-4 pt-4">
                  <Link
                    href="/dashboard-customer"
                    className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              )}
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
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                Create Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

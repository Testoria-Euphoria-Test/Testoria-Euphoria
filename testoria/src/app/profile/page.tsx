"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, BookOpen, FileText, Save, ArrowLeft, Edit, Eye } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProfileUploader from '@/components/ProfileUploader';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';

interface ProfileData {
    _id?: string;
    userId: string;
    photoUrl?: string;
    education?: string;
    certificates?: string[];
    bio?: string;
    createdAt?: string;
    updatedAt?: string;
}

function CertificateImage({ src, alt, index }: { src: string; alt: string; index: number }) {
    const [imageError, setImageError] = useState(false);

    if (imageError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center p-4">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 font-medium">Certificate {index + 1}</p>
                    <p className="text-xs text-gray-500">Image not available</p>
                </div>
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            priority={index < 3} // Prioritize loading of first 3 certificates
        />
    );
}

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData>({
        userId: '',
        photoUrl: '',
        education: '',
        certificates: [],
        bio: ''
    });

    const [formData, setFormData] = useState({
        education: '',
        bio: ''
    });

    // Load profile data on mount
    useEffect(() => {
        loadProfile();
    }, []); // Empty dependency array to only run on mount

    const loadProfile = async () => {
        try {
            setLoading(true);

            const response = await fetch('/api/profile', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/login');
                    return;
                }
                throw new Error('Failed to load profile');
            }

            const data = await response.json();

            if (data.success) {
                setProfileData(data.data);
                setFormData({
                    education: data.data.education || '',
                    bio: data.data.bio || ''
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = (updatedProfile: ProfileData) => {
        setProfileData(updatedProfile);

        // Only update form data for text fields if not currently editing
        // This prevents overwriting user's unsaved changes during certificate uploads
        if (!isEditing) {
            setFormData({
                education: updatedProfile.education || '',
                bio: updatedProfile.bio || ''
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (saving) return;

        setSaving(true);

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Profile updated successfully');
                setProfileData(data.data);
                setIsEditing(false); // Switch back to view mode
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setFormData({
            education: profileData.education || '',
            bio: profileData.bio || ''
        });
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">Loading profile...</span>
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
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                        <div className="space-y-4">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-1" />
                                Back
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                                <p className="text-gray-600">
                                    {isEditing ? 'Edit your profile information and documents' : 'View and manage your profile'}
                                </p>
                            </div>
                        </div>

                        {/* Edit Button - Only show when not editing */}
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {!isEditing ? (
                        // VIEW MODE - Profile Display
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-lg border border-gray-200 p-8">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                                        <Eye className="w-6 h-6 mr-3" />
                                        Profile Information
                                    </h2>
                                </div>

                                <div className="flex items-start space-x-8">
                                    {/* Profile Photo */}
                                    <div className="flex-shrink-0">
                                        {profileData.photoUrl ? (
                                            <img
                                                src={profileData.photoUrl}
                                                alt="Profile"
                                                className="w-40 h-40 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center border-4 border-gray-200 shadow-lg">
                                                <User className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Profile Information */}
                                    <div className="flex-1 min-w-0 space-y-6">
                                        {/* Education */}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-700 flex items-center mb-3">
                                                <BookOpen className="w-5 h-5 mr-2" />
                                                Education
                                            </h3>
                                            {profileData.education ? (
                                                <p className="text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-200 leading-relaxed">
                                                    {profileData.education}
                                                </p>
                                            ) : (
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <p className="text-gray-500 italic">No education information added</p>
                                                    <button
                                                        onClick={() => setIsEditing(true)}
                                                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                    >
                                                        Add education info →
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bio */}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-700 flex items-center mb-3">
                                                <FileText className="w-5 h-5 mr-2" />
                                                Bio
                                            </h3>
                                            {profileData.bio ? (
                                                <p className="text-gray-900 whitespace-pre-wrap bg-green-50 p-4 rounded-lg border border-green-200 leading-relaxed">
                                                    {profileData.bio}
                                                </p>
                                            ) : (
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <p className="text-gray-500 italic">No bio added</p>
                                                    <button
                                                        onClick={() => setIsEditing(true)}
                                                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                    >
                                                        Add bio →
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Certificates */}
                                {profileData.certificates && profileData.certificates.length > 0 && (
                                    <div className="mt-8 pt-8 border-t border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-700 flex items-center mb-6">
                                            <FileText className="w-5 h-5 mr-2" />
                                            Certificates ({profileData.certificates.length})
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {profileData.certificates.map((cert, index) => (
                                                <div key={index} className="group cursor-pointer" onClick={() => window.open(cert, '_blank')}>
                                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                                                        {/* Certificate Image */}
                                                        <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                                                            {/* Check if it's a PDF */}
                                                            {cert.toLowerCase().includes('.pdf') ? (
                                                                <div className="w-full h-full flex items-center justify-center bg-red-50">
                                                                    <div className="text-center p-4">
                                                                        <FileText className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                                                        <p className="text-sm text-gray-700 font-medium">PDF Certificate</p>
                                                                        <p className="text-xs text-gray-500">Click to view</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <CertificateImage
                                                                    src={cert}
                                                                    alt={`Certificate ${index + 1}`}
                                                                    index={index}
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Certificate Info */}
                                                        <div className="p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                                                        {cert.toLowerCase().includes('.pdf') ? (
                                                                            <FileText className="w-4 h-4 text-red-600" />
                                                                        ) : (
                                                                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-medium text-gray-900">Certificate {index + 1}</h4>
                                                                        <p className="text-sm text-gray-500">
                                                                            {cert.toLowerCase().includes('.pdf') ? 'PDF Document' : 'Professional Certification'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* View All Button (if more than 6 certificates) */}
                                        {profileData.certificates.length > 6 && (
                                            <div className="mt-6 text-center">
                                                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                                    View All Certificates ({profileData.certificates.length})
                                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Empty state - if no certificates */}
                                {(!profileData.certificates || profileData.certificates.length === 0) && (
                                    <div className="mt-8 pt-8 border-t border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-700 flex items-center mb-4">
                                            <FileText className="w-5 h-5 mr-2" />
                                            Certificates
                                        </h3>
                                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 mb-3">No certificates uploaded yet</p>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                Upload certificates →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Complete empty state */}
                                {!profileData.education && !profileData.bio && (!profileData.certificates || profileData.certificates.length === 0) && !profileData.photoUrl && (
                                    <div className="text-center py-12">
                                        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Profile</h3>
                                        <p className="text-gray-500 mb-4">Add your information to create a professional profile</p>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            <Edit className="w-5 h-5 mr-2" />
                                            Start Building Profile
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // EDIT MODE - Single Column Layout (No Preview)
                        <div className="max-w-4xl mx-auto">
                            <div className="space-y-6">
                                {/* Basic Information Form */}
                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    {/* Basic Information */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <User className="w-5 h-5 mr-2" />
                                            Basic Information
                                        </h3>

                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Education Field */}
                                            <div>
                                                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                                                    <BookOpen className="w-4 h-4 inline mr-1" />
                                                    Education
                                                </label>
                                                <input
                                                    type="text"
                                                    id="education"
                                                    name="education"
                                                    value={formData.education}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Bachelor of Computer Science, University of Example"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    maxLength={200}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formData.education.length}/200 characters
                                                </p>
                                            </div>

                                            {/* Bio Field */}
                                            <div>
                                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                                                    <FileText className="w-4 h-4 inline mr-1" />
                                                    Bio
                                                </label>
                                                <textarea
                                                    id="bio"
                                                    name="bio"
                                                    value={formData.bio}
                                                    onChange={handleInputChange}
                                                    placeholder="Tell us about yourself, your experience, and interests..."
                                                    rows={6}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                                                    maxLength={500}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formData.bio.length}/500 characters
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-6 flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {saving ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                {/* Profile Uploader Component - Outside form to prevent interference */}
                                <ProfileUploader
                                    profileData={profileData}
                                    onProfileUpdate={handleProfileUpdate}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Toaster position="top-right" />
        </div>
    );
}

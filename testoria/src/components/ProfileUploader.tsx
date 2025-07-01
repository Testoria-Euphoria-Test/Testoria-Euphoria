"use client";

import { useState, useRef } from 'react';
import { Upload, X, Camera, FileText, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileUploaderProps {
  profileData: {
    photoUrl?: string;
    certificates?: string[];
    education?: string;
    bio?: string;
  };
  onProfileUpdate: (updatedProfile: any) => void;
  className?: string;
}

export default function ProfileUploader({ 
  profileData, 
  onProfileUpdate, 
  className = "" 
}: ProfileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [selectedCertificates, setSelectedCertificates] = useState<File[]>([]);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const certificateInputRef = useRef<HTMLInputElement>(null);

  // Upload profile photo
  const handlePhotoUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large. Maximum 5MB allowed');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch('/api/profile/upload-photo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Profile photo uploaded successfully');
        onProfileUpdate(data.data.profile);
        setPreviewPhoto(null);
      } else {
        toast.error(data.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete profile photo
  const handlePhotoDelete = async () => {
    if (!profileData.photoUrl) return;

    setIsUploading(true);
    
    try {
      const response = await fetch('/api/profile/upload-photo', {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Profile photo deleted successfully');
        // Refresh profile data
        const profileResponse = await fetch('/api/profile', {
          method: 'GET',
          credentials: 'include'
        });
        const profileData = await profileResponse.json();
        onProfileUpdate(profileData.data);
      } else {
        toast.error(data.message || 'Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    } finally {
      setIsUploading(false);
    }
  };

  // Upload certificate
  const handleCertificateUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Maximum 10MB allowed');
      return;
    }

    setUploadingCertificate(true);
    
    try {
      const formData = new FormData();
      formData.append('certificate', file);

      const response = await fetch('/api/profile/upload-certificate', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Certificate uploaded successfully');
        onProfileUpdate(data.data.profile);
      } else {
        toast.error(data.message || 'Failed to upload certificate');
      }
    } catch (error) {
      console.error('Error uploading certificate:', error);
      toast.error('Failed to upload certificate');
    } finally {
      setUploadingCertificate(false);
    }
  };

  // Delete certificate
  const handleCertificateDelete = async (certificateUrl: string) => {
    try {
      const response = await fetch('/api/profile/upload-certificate', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ certificateUrl })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Certificate deleted successfully');
        // Refresh profile data
        const profileResponse = await fetch('/api/profile', {
          method: 'GET',
          credentials: 'include'
        });
        const profileData = await profileResponse.json();
        onProfileUpdate(profileData.data);
      } else {
        toast.error(data.message || 'Failed to delete certificate');
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast.error('Failed to delete certificate');
    }
  };

  // Handle file input changes
  const handlePhotoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      handlePhotoUpload(file);
    }
  };

  const handleCertificateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      handleCertificateUpload(file);
    });
    
    // Reset input
    if (certificateInputRef.current) {
      certificateInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Profile Photo Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Profile Photo
        </h3>
        
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Photo Display */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {previewPhoto || profileData.photoUrl ? (
                <img 
                  src={previewPhoto || profileData.photoUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            
            {(profileData.photoUrl && !isUploading) && (
              <button
                onClick={handlePhotoDelete}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                title="Delete photo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <div className="space-y-3">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoInputChange}
                className="hidden"
              />
              
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </>
                )}
              </button>
              
              <p className="text-sm text-gray-500">
                Supported formats: JPEG, PNG, WebP<br />
                Maximum size: 5MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Certificates ({profileData.certificates?.length || 0}/10)
          </h3>
          
          <input
            ref={certificateInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
            onChange={handleCertificateInputChange}
            className="hidden"
            multiple
          />
          
          <button
            onClick={() => certificateInputRef.current?.click()}
            disabled={uploadingCertificate || (profileData.certificates?.length || 0) >= 10}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploadingCertificate ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Add Certificate
              </>
            )}
          </button>
        </div>

        {/* Certificates Grid */}
        {profileData.certificates && profileData.certificates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profileData.certificates.map((certUrl, index) => {
              const isPdf = certUrl.includes('.pdf');
              const fileName = `Certificate ${index + 1}${isPdf ? '.pdf' : ''}`;
              
              return (
                <div key={index} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                  {isPdf ? (
                    <div className="aspect-square bg-red-50 flex flex-col items-center justify-center p-4">
                      <FileText className="w-12 h-12 text-red-500 mb-2" />
                      <p className="text-sm text-gray-600 text-center">{fileName}</p>
                    </div>
                  ) : (
                    <div className="aspect-square">
                      <img 
                        src={certUrl} 
                        alt={fileName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(certUrl, '_blank')}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                        title="View certificate"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCertificateDelete(certUrl)}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                        title="Delete certificate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No certificates uploaded yet</p>
            <p className="text-sm">Upload your certificates to showcase your qualifications</p>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          <p>Supported formats: JPEG, PNG, WebP, PDF</p>
          <p>Maximum size: 10MB per file | Maximum: 10 certificates</p>
        </div>
      </div>
    </div>
  );
}

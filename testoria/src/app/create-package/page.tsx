"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  DollarSign,
  Clock,
  Tag,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import toast, { Toaster } from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface FormData {
  title: string;
  description: string;
  categoryId: string;
  duration: number;
  price: number;
  file: File | null;
  images: string[]; // Array of image URLs for package cover slideshow
}

export default function CreatePackagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    categoryId: "",
    duration: 60,
    price: 0,
    file: null,
    images: [], // Initialize empty images array
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState(""); // For adding new image URLs

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const result = await response.json();
      setCategories(result.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' ? Number(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('File size must be less than 50MB');
        return;
      }
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('File size must be less than 50MB');
        return;
      }
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    // Simple URL validation
    try {
      new URL(newImageUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    if (formData.images.includes(newImageUrl)) {
      toast.error('This image URL is already added');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl]
    }));
    setNewImageUrl("");
    toast.success('Image URL added successfully');
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    toast.success('Image removed successfully');
  };

  const handleMoveImageUp = (index: number) => {
    if (index === 0) return;
    setFormData(prev => {
      const newImages = [...prev.images];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      return { ...prev, images: newImages };
    });
  };

  const handleMoveImageDown = (index: number) => {
    if (index === formData.images.length - 1) return;
    setFormData(prev => {
      const newImages = [...prev.images];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      return { ...prev, images: newImages };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.file) {
      toast.error('Please select a PDF file');
      return;
    }
    if (formData.duration < 1) {
      toast.error('Duration must be at least 1 minute');
      return;
    }
    if (formData.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const submitFormData = new FormData();
      submitFormData.append('file', formData.file);
      submitFormData.append('title', formData.title);
      submitFormData.append('description', formData.description);
      submitFormData.append('categoryId', formData.categoryId);
      submitFormData.append('duration', formData.duration.toString());
      submitFormData.append('price', formData.price.toString());
      submitFormData.append('images', JSON.stringify(formData.images)); // Add images array

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/packages', {
        method: 'POST',
        credentials: 'include',
        body: submitFormData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create package');
      }

      const result = await response.json();
      
      toast.success('Package created successfully!');
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard-creator');
      }, 1500);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create package';
      toast.error(errorMessage);
      setUploadProgress(0);
    } finally {
      setLoading(false);
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
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Buat Paket Baru</h1>
            <p className="text-gray-600 mt-2">
              Upload materi pembelajaran dan buat paket komprehensif untuk siswa
            </p>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-gray-400">
            <form onSubmit={handleSubmit} className="p-6 lg:p-8">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Paket *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Masukkan judul paket yang deskriptif"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Jelaskan secara detail apa yang akan dipelajari siswa"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Category and Duration Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                      <Tag className="w-4 h-4 inline mr-1" />
                      Kategori *
                    </label>
                    {loadingCategories ? (
                      <div className="flex items-center justify-center py-3 border border-gray-300 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Memuat kategori...
                      </div>
                    ) : (
                      <select
                        id="categoryId"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Pilih kategori</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Durasi (menit) *
                    </label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="60"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Harga (IDR) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    placeholder="50000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Isi 0 untuk paket gratis
                  </p>
                </div>

                {/* Package Cover Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4 inline mr-1" />
                    Package Cover Images (Optional)
                  </label>
                  <p className="text-sm text-gray-500 mb-4">
                    Add image URLs that will be displayed as a slideshow on your package card. If no images are provided, a default cover will be shown.
                  </p>
                  
                  {/* Add Image URL Input */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Images List */}
                  {formData.images.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Added Images ({formData.images.length}):</p>
                      {formData.images.map((imageUrl, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                          {/* Image Preview */}
                          <img
                            src={imageUrl}
                            alt={`Package cover ${index + 1}`}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAyMEMxNiAxOC44OTU0IDE2Ljg5NTQgMTggMTggMThDMTkuMTA0NiAxOCAyMCAxOC44OTU0IDIwIDIwQzIwIDIxLjEwNDYgMTkuMTA0NiAyMiAxOCAyMkMxNi44OTU0IDIyIDE2IDIxLjEwNDYgMTYgMjBaIiBmaWxsPSIjOUI5Qjk5Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOCAxMkM4IDEwLjg5NTQgOC44OTU0MyAxMCAxMCAxMEgzMEMzMS4xMDQ2IDEwIDMyIDEwLjg5NTQgMzIgMTJWMjhDMzIgMjkuMTA0NiAzMS4xMDQ2IDMwIDMwIDMwSDEwQzguODk1NDMgMzAgOCAyOS4xMDQ2IDggMjhWMTJaTTEwIDEySDMwVjI0LjU4NTlMMjYuNzA3MSAyMS4yOTI5QzI2LjMxNjYgMjAuOTAyNCAyNS42ODM0IDIwLjkwMjQgMjUuMjkyOSAyMS4yOTI5TDIwIDI2LjU4NTlMMTUuNzA3MSAxNy4yOTI5QzE1LjMxNjYgMTYuOTAyNCAxNC42ODM0IDE2LjkwMjQgMTQuMjkyOSAxNy4yOTI5TDEwIDIxLjU4NTlWMTJaIiBmaWxsPSIjOUI5Qjk5Ii8+Cjwvc3ZnPgo=';
                            }}
                          />
                          
                          {/* URL Text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Image {index + 1}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {imageUrl}
                            </p>
                          </div>

                          {/* Move Controls */}
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveImageUp(index)}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImageDown(index)}
                              disabled={index === formData.images.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.images.length === 0 && (
                    <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">No images added yet</p>
                      <p className="text-xs text-gray-400">Package will use default cover image</p>
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Materi PDF *
                  </label>
                  
                  {/* Drag and Drop Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : formData.file
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    {formData.file ? (
                      <div className="text-green-600">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-medium">{formData.file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(formData.file.size)}</p>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-medium">Tarik PDF ke sini atau klik untuk memilih</p>
                        <p className="text-sm">Ukuran maksimal file: 50MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Progress */}
                {loading && uploadProgress > 0 && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Mengunggah dan memproses...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Apa yang terjadi setelah upload:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>PDF Anda akan diproses dan diubah menjadi gambar</li>
                        <li>AI akan mengekstrak soal dan konten secara otomatis</li>
                        <li>Paket akan disimpan sebagai draft (belum dipublikasikan)</li>
                        <li>Anda dapat meninjau dan mengedit sebelum mempublikasikan</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading || !formData.file}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Membuat Paket...
                      </div>
                    ) : (
                      'Buat Paket'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

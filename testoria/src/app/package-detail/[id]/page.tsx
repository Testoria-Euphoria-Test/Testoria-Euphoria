"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowLeft,
  Package,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  FileText,
  Clock,
  BookOpen,
  Target,
  CheckCircle2,
  AlertTriangle,
  ImagePlus,
  Wand2,
  Link,
  Eye,
  ChevronUp,
  ChevronDown,
  Upload,
} from "lucide-react";
import Navbar from "@/components/Navbar";

// Types
interface Package {
  _id: string;
  title: string;
  description: string;
  sourcePdf: string[];
  pdfImages: string[];
  images: string[]; // Add images field for package cover slideshow
  contents: any[];
  categoryId: string;
  creatorId: string;
  duration: number;
  price: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt?: Date;
  categoryName?: string;
  creatorName?: string;
}

interface Question {
  _id: string;
  packageId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE?: string;
  correctAnswer: string;
  explanation?: string;
  passage?: string; // Reading passage for the question(s)
  imagePrompt?: string; // Description of images needed for the question
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface QuestionFormData {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: string;
  explanation: string;
  passage: string; // Reading passage for the question(s)
  imagePrompt: string; // Description of images needed for the question
}

export default function PackageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Edit states
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [editPackageData, setEditPackageData] = useState<Partial<Package>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Question states
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestionData, setEditQuestionData] = useState<QuestionFormData>({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    optionE: "",
    correctAnswer: "",
    explanation: "",
    passage: "",
    imagePrompt: "",
  });
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestionData, setNewQuestionData] = useState<QuestionFormData>({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    optionE: "",
    correctAnswer: "",
    explanation: "",
    passage: "",
    imagePrompt: "",
  });

  // Image management states
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentQuestionForImage, setCurrentQuestionForImage] = useState<string | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isUploadingQuestionImage, setIsUploadingQuestionImage] = useState(false);
  const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(null);
  // Package image upload states
  const [isUploadingPackageImage, setIsUploadingPackageImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState("");

  // Load data on component mount
  useEffect(() => {
    if (packageId) {
      loadPackageDetail();
    }
  }, [packageId]);

  const loadPackageDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Check authentication
      const authResponse = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
      });

      if (!authResponse.ok) {
        throw new Error('Autentikasi diperlukan');
      }

      const authData = await authResponse.json();
      const currentUserId = authData.data.userId;
      setUserRole(authData.data.userRole || 'creator');

      // Load package data
      const packageResponse = await fetch(`/api/packages/${packageId}?withDetails=true`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!packageResponse.ok) {
        throw new Error('Gagal memuat data paket');
      }

      const packageResult = await packageResponse.json();
      const pkg = packageResult.data;
      setPackageData(pkg);

      // Set initial edit data
      setEditPackageData({
        title: pkg.title,
        description: pkg.description,
        price: pkg.price,
        duration: pkg.duration,
        isPublished: pkg.isPublished,
        images: pkg.images || [] // Include images field
      });

      // Check if user is owner
      setIsOwner(pkg.creatorId === currentUserId || authData.data.userRole === 'admin');

      // Load questions
      const questionsResponse = await fetch(`/api/questions?packageId=${packageId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (questionsResponse.ok) {
        const questionsResult = await questionsResponse.json();
        setQuestions(questionsResult.questions || []);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load package data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  // Package edit handlers
  const handleEditPackage = () => {
    setIsEditingPackage(true);
  };

  const handleSavePackage = async () => {
    if (!packageData) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/packages/${packageData._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editPackageData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memperbarui paket');
      }

      // Update local state
      setPackageData(prev => prev ? { ...prev, ...editPackageData } : null);
      setIsEditingPackage(false);
      toast.success('Paket berhasil diperbarui');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui paket';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelEditPackage = () => {
    setIsEditingPackage(false);
    setEditPackageData({
      title: packageData?.title,
      description: packageData?.description,
      price: packageData?.price,
      duration: packageData?.duration,
      isPublished: packageData?.isPublished,
      images: packageData?.images || [] // Include images field
    });
  };

  // Package images management handlers
  const handleUploadPackageImage = async (file: File) => {
    if (!file) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setUploadPreview(previewUrl);

    setIsUploadingPackageImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/packages/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const result = await response.json();
      const imageUrl = result.data.imageUrl;

      // Check if image already exists
      const currentImages = editPackageData.images || [];
      if (currentImages.includes(imageUrl)) {
        toast.error('This image is already added');
        return;
      }

      // Add to package images
      setEditPackageData(prev => ({
        ...prev,
        images: [...currentImages, imageUrl]
      }));

      toast.success('Image uploaded and added successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(errorMessage);
    } finally {
      setIsUploadingPackageImage(false);
      // Clean up preview
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview);
        setUploadPreview(null);
      }
    }
  };

  const handlePackageImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUploadPackageImage(file);
    }
    // Reset input value to allow same file selection again
    event.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleUploadPackageImage(file);
    } else {
      toast.error('Please drop a valid image file');
    }
  };

  const handleRemovePackageImage = async (index: number) => {
    const currentImages = editPackageData.images || [];
    const imageUrl = currentImages[index];

    if (!imageUrl) return;

    if (!confirm('Are you sure you want to remove this image? This action cannot be undone.')) return;

    try {
      // Call delete API to remove from Cloudinary
      const response = await fetch('/api/packages/delete-image', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl })
      });

      if (!response.ok) {
        console.warn('Failed to delete from Cloudinary, but continuing with local removal');
      }

      // Remove from local state regardless of Cloudinary deletion result
      setEditPackageData(prev => ({
        ...prev,
        images: currentImages.filter((_, i) => i !== index)
      }));

      toast.success('Image removed successfully');
    } catch (error) {
      console.error('Error removing image:', error);
      // Still remove from local state even if API call fails
      setEditPackageData(prev => ({
        ...prev,
        images: currentImages.filter((_, i) => i !== index)
      }));
      toast.success('Image removed from list (cleanup may be pending)');
    }
  };

  const handleMovePackageImageUp = (index: number) => {
    const currentImages = editPackageData.images || [];
    if (index === 0) return;

    const newImages = [...currentImages];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    setEditPackageData(prev => ({ ...prev, images: newImages }));
  };

  const handleMovePackageImageDown = (index: number) => {
    const currentImages = editPackageData.images || [];
    if (index === currentImages.length - 1) return;

    const newImages = [...currentImages];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    setEditPackageData(prev => ({ ...prev, images: newImages }));
  };

  // Question edit handlers
  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question._id);
    setEditQuestionData({
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      optionE: question.optionE || "",
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
      passage: question.passage || "",
      imagePrompt: question.imagePrompt || "",
    });
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestionId) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/questions/${editingQuestionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editQuestionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update question');
      }

      // Update local state
      setQuestions(prev => prev.map(q =>
        q._id === editingQuestionId
          ? { ...q, ...editQuestionData }
          : q
      ));

      setEditingQuestionId(null);
      toast.success('Question updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update question';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditQuestionData({
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      optionE: "",
      correctAnswer: "",
      explanation: "",
      passage: "",
      imagePrompt: "",
    });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Apa kamu yakiin ingin menghapus pertanyaan ini?')) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menghapus pertanyaan');
      }

      // Update local state
      setQuestions(prev => prev.filter(q => q._id !== questionId));
      toast.success('Pertanyaan berhasil dihapus');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus pertanyaan';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add new question handlers
  const handleAddQuestion = async () => {
    if (!packageData) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/questions/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: packageData._id,
          ...newQuestionData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create question');
      }

      const result = await response.json();

      // Add to local state
      setQuestions(prev => [...prev, result.data]);

      // Reset form
      setNewQuestionData({
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        optionE: "",
        correctAnswer: "",
        explanation: "",
        passage: "",
        imagePrompt: "",
      });
      setShowAddQuestion(false);
      toast.success('Question created successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create question';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // AI Processing
  const handleProcessAI = async () => {
    if (!packageData) return;

    setIsProcessing(true);
    try {
      // Step 1: Process AI
      const processResponse = await fetch(`/api/packages/${packageData._id}/process`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.message || 'Failed to process AI');
      }

      // Step 2: Generate questions
      const questionsResponse = await fetch('/api/questions', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId: packageData._id })
      });

      if (!questionsResponse.ok) {
        const errorData = await questionsResponse.json();
        throw new Error(errorData.message || 'Failed to generate questions');
      }

      const questionsResult = await questionsResponse.json();

      toast.success(`AI processing completed! Generated ${questionsResult.questionsCreated} questions`);

      // Reload data
      await loadPackageDetail();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process AI';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Image management functions
  const handleGenerateImage = async (questionId: string, imagePrompt: string) => {
    if (!imagePrompt.trim()) {
      toast.error('Please provide an image prompt first');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/questions/generate-image', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          imagePrompt: imagePrompt.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate image');
      }

      const result = await response.json();

      // Add the generated image to the question's images array
      const imageUrl = result.data.cloudinaryUrl;
      await handleAddManualImage(questionId, imageUrl);

      toast.success('Image generated and added successfully!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
      toast.error(errorMessage);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAddManualImage = async (questionId: string, imageUrl: string) => {
    if (!imageUrl.trim()) {
      toast.error('Please provide an image URL');
      return;
    }

    try {
      const response = await fetch('/api/questions/add-image', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          imageUrl: imageUrl.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add image');
      }

      // Update local state
      setQuestions(prev => prev.map(q =>
        q._id === questionId
          ? { ...q, images: [...(q.images || []), imageUrl.trim()] }
          : q
      ));

      toast.success('Image added successfully!');
      setManualImageUrl("");
      setShowImageModal(false);
      setCurrentQuestionForImage(null);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add image';
      toast.error(errorMessage);
    }
  };

  // Handle question image file upload
  const handleUploadQuestionImage = async (questionId: string, file: File) => {
    if (!file) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setQuestionImagePreview(previewUrl);

    setIsUploadingQuestionImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/questions/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const result = await response.json();
      const imageUrl = result.data.imageUrl;

      // Add to question images using the existing API
      await handleAddManualImage(questionId, imageUrl);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(errorMessage);
    } finally {
      setIsUploadingQuestionImage(false);
      // Clean up preview
      if (questionImagePreview) {
        URL.revokeObjectURL(questionImagePreview);
        setQuestionImagePreview(null);
      }
    }
  };

  const handleQuestionImageFileSelect = (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUploadQuestionImage(questionId, file);
    }
    // Reset input value to allow same file selection again
    event.target.value = '';
  };

  const handleRemoveImage = async (questionId: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to remove this image?')) return;

    try {
      const response = await fetch('/api/questions/add-image', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          imageUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove image');
      }

      // Update local state
      setQuestions(prev => prev.map(q =>
        q._id === questionId
          ? { ...q, images: (q.images || []).filter(url => url !== imageUrl) }
          : q
      ));

      toast.success('Image removed successfully!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove image';
      toast.error(errorMessage);
    }
  };

  const openImageModal = (questionId: string) => {
    setCurrentQuestionForImage(questionId);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setCurrentQuestionForImage(null);
    setManualImageUrl("");
    // Clean up question image preview if exists
    if (questionImagePreview) {
      URL.revokeObjectURL(questionImagePreview);
      setQuestionImagePreview(null);
    }
  };

  const viewImage = (imageUrl: string) => {
    setViewingImageUrl(imageUrl);
    setShowImageViewer(true);
  };

  // Currency formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat detail paket...</span>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Gagal Memuat Paket</h2>
            <p className="text-gray-600 mb-4">{error || 'Paket tidak ditemukan'}</p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Kembali
            </button>
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-blue-900" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detail Paket</h1>
                <p className="text-gray-600">Kelola informasi dan soal paket</p>
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center space-x-3">
                {packageData.sourcePdf && packageData.sourcePdf.length > 0 && (
                  <button
                    onClick={handleProcessAI}
                    disabled={isProcessing}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Target className="w-4 h-4" />
                    )}
                    <span>{isProcessing ? 'Memproses...' : 'Proses AI & Generate Soal'}</span>
                  </button>
                )}

                {!isEditingPackage ? (
                  <button
                    onClick={handleEditPackage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Paket</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSavePackage}
                      disabled={isProcessing}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan</span>
                    </button>
                    <button
                      onClick={handleCancelEditPackage}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Batal</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Package Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Package className="w-8 h-8 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Informasi Paket</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-gray-600">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Judul</label>
                    {isEditingPackage ? (
                      <input
                        type="text"
                        value={editPackageData.title || ''}
                        onChange={(e) => setEditPackageData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{packageData.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                    {isEditingPackage ? (
                      <textarea
                        value={editPackageData.description || ''}
                        onChange={(e) => setEditPackageData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-600">{packageData.description}</p>
                    )}
                  </div>

                  {/* Package Cover Images Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Cover Images
                    </label>
                    {isEditingPackage ? (<div className="space-y-4">
                      <p className="text-sm text-gray-500">
                        Upload images that will be displayed as a slideshow on your package card.
                      </p>

                      {/* Upload Image Area */}
                      <div
                        className={`flex gap-2 ${isDragOver ? 'opacity-75' : ''
                          }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          id="package-image-upload"
                          accept="image/*"
                          onChange={handlePackageImageFileSelect}
                          className="hidden"
                          disabled={isUploadingPackageImage}
                        />
                        <label
                          htmlFor="package-image-upload"
                          className={`flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${isUploadingPackageImage
                            ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-50'
                            : isDragOver
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                        >
                          {isUploadingPackageImage ? (
                            <div className="flex flex-col items-center space-y-3">
                              {uploadPreview && (
                                <img
                                  src={uploadPreview}
                                  alt="Upload preview"
                                  className="w-16 h-16 object-cover rounded-lg opacity-75"
                                />
                              )}
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="text-sm text-gray-600">Uploading image...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center space-y-2">
                              <Upload className={`w-6 h-6 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                              <div className="text-center">
                                <span className={`text-sm font-medium ${isDragOver ? 'text-blue-600' : 'text-gray-600'}`}>
                                  Click to upload or drag & drop
                                </span>
                                <p className="text-xs text-gray-400 mt-1">
                                  {isDragOver ? 'Drop your image here' : 'PNG, JPG, WebP up to 5MB'}
                                </p>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>

                      {/* Images List */}
                      {(editPackageData.images && editPackageData.images.length > 0) ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Added Images ({editPackageData.images.length}):
                          </p>
                          {editPackageData.images.map((imageUrl, index) => (
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
                                  onClick={() => handleMovePackageImageUp(index)}
                                  disabled={index === 0}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Move up"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMovePackageImageDown(index)}
                                  disabled={index === (editPackageData.images?.length || 0) - 1}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Move down"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={() => handleRemovePackageImage(index)}
                                className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                title="Remove image"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                          <ImagePlus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">No images added yet</p>
                          <p className="text-xs text-gray-400">Package will use default cover</p>
                        </div>
                      )}
                    </div>
                    ) : (
                      <div>
                        {(packageData.images && packageData.images.length > 0) ? (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 mb-2">
                              {packageData.images.length} image(s) configured for slideshow
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                              {packageData.images.map((imageUrl, index) => (
                                <img
                                  key={index}
                                  src={imageUrl}
                                  alt={`Package cover ${index + 1}`}
                                  className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                                  onClick={() => {
                                    setViewingImageUrl(imageUrl);
                                    setShowImageViewer(true);
                                  }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAyMEMxNiAxOC44OTU0IDE2Ljg5NTQgMTggMTggMThDMTkuMTA0NiAxOCAyMCAxOC44OTU0IDIwIDIwQzIwIDIxLjEwNDYgMTkuMTA0NiAyMiAxOCAyMkMxNi44OTU0IDIyIDE2IDIxLjEwNDYgMTYgMjBaIiBmaWxsPSIjOUI5Qjk5Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOCAxMkM4IDEwLjg5NTQgOC44OTU0MyAxMCAxMCAxMEgzMEMzMS4xMDQ2IDEwIDMyIDEwLjg5NTQgMzIgMTJWMjhDMzIgMjkuMTA0NiAzMS4xMDQ2IDMwIDMwIDMwSDEwQzguODk1NDMgMzAgOCAyOS4xMDQ2IDggMjhWMTJaTTEwIDEySDMwVjI0LjU4NTlMMjYuNzA3MSAyMS4yOTI5QzI2LjMxNjYgMjAuOTAyNCAyNS42ODM0IDIwLjkwMjQgMjUuMjkyOSAyMS4yOTI5TDIwIDI2LjU4NTlMMTUuNzA3MSAxNy4yOTI5QzE1LjMxNjYgMTYuOTAyNCAxNC42ODM0IDE2LjkwMjQgMTQuMjkyOSAxNy4yOTI5TDEwIDIxLjU4NTlWMTJaIiBmaWxsPSIjOUI5Qjk5Ii8+Cjwvc3ZnPgo=';
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No images configured - using default cover</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Harga</label>
                      {isEditingPackage ? (
                        <input
                          type="number"
                          value={editPackageData.price || ''}
                          onChange={(e) => setEditPackageData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{formatCurrency(packageData.price)}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Durasi (menit)</label>
                      {isEditingPackage ? (
                        <input
                          type="number"
                          value={editPackageData.duration || ''}
                          onChange={(e) => setEditPackageData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{packageData.duration} menit</p>
                      )}
                    </div>
                  </div>

                  {userRole === 'admin' && (
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isEditingPackage ? (editPackageData.isPublished || false) : packageData.isPublished}
                          onChange={(e) => isEditingPackage && setEditPackageData(prev => ({ ...prev, isPublished: e.target.checked }))}
                          disabled={!isEditingPackage}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Published</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Right Column - Stats */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-blue-600">AI Content</span>
                      </div>
                      <p className="text-xl font-bold text-blue-900">{packageData.contents?.length || 0}</p>
                      <p className="text-xs text-blue-600">Item konten</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-600">Questions</span>
                      </div>
                      <p className="text-xl font-bold text-green-900">{questions.length}</p>
                      <p className="text-xs text-green-600">Total soal</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-purple-600">Source PDFs</span>
                      </div>
                      <p className="text-xl font-bold text-purple-900">{packageData.sourcePdf?.length || 0}</p>
                      <p className="text-xs text-purple-600">File PDF</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm text-yellow-600">Status</span>
                      </div>
                      <p className="text-lg font-bold text-yellow-900">
                        {packageData.isPublished ? 'Terpublikasi' : 'Draft'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Kategori</h4>
                    <p className="text-gray-900">{packageData.categoryName || 'Tanpa Kategori'}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Dibuat</h4>
                    <p className="text-gray-900">{new Date(packageData.createdAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-gray-800">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Soal ({questions.length})</h2>
                    <p className="text-gray-600">Kelola soal untuk paket ini</p>
                  </div>
                </div>

                {isOwner && (
                  <button
                    onClick={() => setShowAddQuestion(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Soal</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada soal</h3>
                  <p className="text-gray-600 mb-4">
                    {packageData.contents && packageData.contents.length > 0
                      ? "Gunakan proses AI untuk membuat soal secara otomatis atau tambahkan secara manual"
                      : "Upload dan proses PDF terlebih dahulu, lalu buat soal"}
                  </p>
                  {isOwner && (
                    <div className="space-x-2">
                      {packageData.sourcePdf && packageData.sourcePdf.length > 0 && (
                        <button
                          onClick={handleProcessAI}
                          disabled={isProcessing}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                          Proses AI & Generate Soal
                        </button>
                      )}
                      <button
                        onClick={() => setShowAddQuestion(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Tambah Soal Manual
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div
                      key={question._id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      {editingQuestionId === question._id ? (
                        /* Edit Mode */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-gray-900">Edit Soal #{index + 1}</h4>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={handleSaveQuestion}
                                disabled={isProcessing}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                              >
                                Simpan
                              </button>
                              <button
                                onClick={handleCancelEditQuestion}
                                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                              >
                                Batal
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Soal</label>
                            <textarea
                              value={editQuestionData.questionText}
                              onChange={(e) => setEditQuestionData(prev => ({ ...prev, questionText: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reading Passage (Optional)</label>
                            <textarea
                              value={editQuestionData.passage}
                              onChange={(e) => setEditQuestionData(prev => ({ ...prev, passage: e.target.value }))}
                              rows={3}
                              placeholder="Enter the reading passage if this question is based on a text..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image Prompt (Optional)</label>
                            <textarea
                              value={editQuestionData.imagePrompt}
                              onChange={(e) => setEditQuestionData(prev => ({ ...prev, imagePrompt: e.target.value }))}
                              rows={2}
                              placeholder="Describe what type of image/diagram should be created for this question..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan A</label>
                              <input
                                type="text"
                                value={editQuestionData.optionA}
                                onChange={(e) => setEditQuestionData(prev => ({ ...prev, optionA: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan B</label>
                              <input
                                type="text"
                                value={editQuestionData.optionB}
                                onChange={(e) => setEditQuestionData(prev => ({ ...prev, optionB: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan C</label>
                              <input
                                type="text"
                                value={editQuestionData.optionC}
                                onChange={(e) => setEditQuestionData(prev => ({ ...prev, optionC: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan D</label>
                              <input
                                type="text"
                                value={editQuestionData.optionD}
                                onChange={(e) => setEditQuestionData(prev => ({ ...prev, optionD: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan E (Opsional)</label>
                              <input
                                type="text"
                                value={editQuestionData.optionE}
                                onChange={(e) => setEditQuestionData(prev => ({ ...prev, optionE: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Jawaban Benar</label>
                              <select
                                value={editQuestionData.correctAnswer}
                                onChange={(e) => setEditQuestionData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Pilih jawaban benar</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                {editQuestionData.optionE && <option value="E">E</option>}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Penjelasan (Opsional)</label>
                            <textarea
                              value={editQuestionData.explanation}
                              onChange={(e) => setEditQuestionData(prev => ({ ...prev, explanation: e.target.value }))}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>


                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bacaan (Opsional)</label>
                            <textarea
                              value={editQuestionData.passage}
                              onChange={(e) => setEditQuestionData(prev => ({ ...prev, passage: e.target.value }))}
                              rows={3}
                              placeholder="Enter the reading passage if this question is based on a text..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image Prompt (Opsional)</label>
                            <textarea
                              value={editQuestionData.imagePrompt}
                              onChange={(e) => setEditQuestionData(prev => ({ ...prev, imagePrompt: e.target.value }))}
                              rows={2}
                              placeholder="Describe what type of image/diagram should be created for this question..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                                Soal #{index + 1}
                              </h4>

                              <p className="text-gray-700 mb-4 leading-relaxed">
                                {question.questionText}
                              </p>

                              {question.passage && (
                                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                  <p className="text-sm text-purple-800">
                                    <span className="font-medium">Bacaan:</span> {question.passage}
                                  </p>
                                </div>
                              )}

                              {/* Images Section - Moved to right after reading passage */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="text-sm font-medium text-gray-700">
                                    Question Images ({question.images?.length || 0})
                                  </h5>
                                  {isOwner && (
                                    <div className="flex items-center space-x-2">
                                      {question.imagePrompt && (
                                        <button
                                          onClick={() => handleGenerateImage(question._id, question.imagePrompt!)}
                                          disabled={isGeneratingImage}
                                          className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-1"
                                          title="Generate image from prompt"
                                        >
                                          {isGeneratingImage ? (
                                            <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                                          ) : (
                                            <Wand2 className="w-3 h-3" />
                                          )}
                                          <span>Generate</span>
                                        </button>
                                      )}
                                      <button
                                        onClick={() => openImageModal(question._id)}
                                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 flex items-center space-x-1"
                                        title="Add manual image URL"
                                      >
                                        <ImagePlus className="w-3 h-3" />
                                        <span>Add Image</span>
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {question.images && question.images.length > 0 ? (
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {question.images.map((imageUrl, imgIndex) => (
                                      <div key={imgIndex} className="relative group">
                                        <img
                                          src={imageUrl}
                                          alt={`Question image ${imgIndex + 1}`}
                                          className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                                          onClick={() => viewImage(imageUrl)}
                                        />
                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <div className="flex space-x-1">
                                            <button
                                              onClick={() => viewImage(imageUrl)}
                                              className="bg-blue-600 text-white p-1 rounded text-xs hover:bg-blue-700"
                                              title="View image"
                                            >
                                              <Eye className="w-3 h-3" />
                                            </button>
                                            {isOwner && (
                                              <button
                                                onClick={() => handleRemoveImage(question._id, imageUrl)}
                                                className="bg-red-600 text-white p-1 rounded text-xs hover:bg-red-700"
                                                title="Remove image"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <ImagePlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No images added yet</p>
                                    {isOwner && question.imagePrompt && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        Click "Generate" to create an image from the prompt
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {question.imagePrompt && (
                                <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                  <p className="text-sm text-orange-800">
                                    <span className="font-medium">Image Prompt:</span> {question.imagePrompt}
                                  </p>
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div className={`p-3 rounded-lg border ${question.correctAnswer === 'A' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                  <span className="font-semibold">A:</span> {question.optionA}
                                </div>
                                <div className={`p-3 rounded-lg border ${question.correctAnswer === 'B' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                  <span className="font-semibold">B:</span> {question.optionB}
                                </div>
                                <div className={`p-3 rounded-lg border ${question.correctAnswer === 'C' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                  <span className="font-semibold">C:</span> {question.optionC}
                                </div>
                                <div className={`p-3 rounded-lg border ${question.correctAnswer === 'D' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                  <span className="font-semibold">D:</span> {question.optionD}
                                </div>
                                {question.optionE && (
                                  <div className={`p-3 rounded-lg border ${question.correctAnswer === 'E' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <span className="font-semibold">E:</span> {question.optionE}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  <span className="text-green-600 font-medium">
                                    Jawaban Benar: {question.correctAnswer}
                                  </span>
                                </div>
                              </div>

                              {question.explanation && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <p className="text-sm text-blue-800">
                                    <span className="font-medium">Penjelasan:</span> {question.explanation}
                                  </p>
                                </div>
                              )}
                            </div>

                            {isOwner && (
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => handleEditQuestion(question)}
                                  className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Question"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(question._id)}
                                  className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Question"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Tambah Soal Baru</h3>
                <button
                  onClick={() => setShowAddQuestion(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Soal</label>
                <textarea
                  value={newQuestionData.questionText}
                  onChange={(e) => setNewQuestionData(prev => ({ ...prev, questionText: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter the question text..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan A</label>
                  <input
                    type="text"
                    value={newQuestionData.optionA}
                    onChange={(e) => setNewQuestionData(prev => ({ ...prev, optionA: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Option A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan B</label>
                  <input
                    type="text"
                    value={newQuestionData.optionB}
                    onChange={(e) => setNewQuestionData(prev => ({ ...prev, optionB: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Option B"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan C</label>
                  <input
                    type="text"
                    value={newQuestionData.optionC}
                    onChange={(e) => setNewQuestionData(prev => ({ ...prev, optionC: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Option C"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan D</label>
                  <input
                    type="text"
                    value={newQuestionData.optionD}
                    onChange={(e) => setNewQuestionData(prev => ({ ...prev, optionD: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Option D"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan E (Opsional)</label>
                  <input
                    type="text"
                    value={newQuestionData.optionE}
                    onChange={(e) => setNewQuestionData(prev => ({ ...prev, optionE: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Option E (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jawaban Benar</label>
                  <select
                    value={newQuestionData.correctAnswer}
                    onChange={(e) => setNewQuestionData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih jawaban benar</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    {newQuestionData.optionE && <option value="E">E</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Penjelasan (Opsional)</label>
                <textarea
                  value={newQuestionData.explanation}
                  onChange={(e) => setNewQuestionData(prev => ({ ...prev, explanation: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional explanation for the correct answer..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bacaan (Opsional)</label>
                <textarea
                  value={newQuestionData.passage}
                  onChange={(e) => setNewQuestionData(prev => ({ ...prev, passage: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter the reading passage if this question is based on a text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Prompt (Opsional)</label>
                <textarea
                  value={newQuestionData.imagePrompt}
                  onChange={(e) => setNewQuestionData(prev => ({ ...prev, imagePrompt: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what type of image/diagram should be created for this question..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleAddQuestion}
                  disabled={isProcessing || !newQuestionData.questionText || !newQuestionData.correctAnswer}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Membuat...' : 'Buat Soal'}
                </button>
                <button
                  onClick={() => setShowAddQuestion(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Management Modal */}
      {showImageModal && currentQuestionForImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add Image to Question</h3>
                <button
                  onClick={closeImageModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload Image File
                </label>
                <div className="flex flex-col space-y-3">
                  <input
                    type="file"
                    id={`question-image-upload-${currentQuestionForImage}`}
                    accept="image/*"
                    onChange={(e) => handleQuestionImageFileSelect(currentQuestionForImage, e)}
                    className="hidden"
                    disabled={isUploadingQuestionImage}
                  />
                  <label
                    htmlFor={`question-image-upload-${currentQuestionForImage}`}
                    className={`flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${isUploadingQuestionImage
                        ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                  >
                    {isUploadingQuestionImage ? (
                      <div className="flex flex-col items-center space-y-3">
                        {questionImagePreview && (
                          <img
                            src={questionImagePreview}
                            alt="Upload preview"
                            className="w-16 h-16 object-cover rounded-lg opacity-75"
                          />
                        )}
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-600">Uploading image...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <div className="text-center">
                          <span className="text-sm font-medium text-gray-600">
                            Click to upload or drag & drop
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG, WebP up to 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>



              {/* AI Generate Section */}
              {(() => {
                const question = questions.find(q => q._id === currentQuestionForImage);
                return question?.imagePrompt && (
                  <div className="border-t pt-4">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-800 mb-3">
                        <span className="font-medium">Image Prompt:</span> {question.imagePrompt}
                      </p>
                      <button
                        onClick={() => handleGenerateImage(currentQuestionForImage, question.imagePrompt!)}
                        disabled={isGeneratingImage || isUploadingQuestionImage}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {isGeneratingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            <span>Generate Image with AI</span>
                          </>
                        )}
                      </button>
                      <p className="text-xs text-purple-600 mt-2 text-center">
                        AI will generate an image based on the prompt and automatically add it to the question
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && viewingImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setShowImageViewer(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={viewingImageUrl}
              alt="Question image"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}

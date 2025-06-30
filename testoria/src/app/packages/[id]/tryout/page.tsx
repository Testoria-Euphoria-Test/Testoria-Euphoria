"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation"; // ✅ Add Next.js router
import { QuestionType } from "@/types/question";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Package {
  _id: string;
  title: string;
  description: string;
  duration: number;
}

export default function TryoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Unwrap params Promise menggunakan React.use()
  const { id } = use(params);
  const router = useRouter(); // ✅ Add router for navigation

  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingCompletion, setCheckingCompletion] = useState(true); // ✅ New state for completion check
  const [redirecting, setRedirecting] = useState(false); // ✅ State for redirect message

  // ✅ Wrap handleFinishTryout dengan useCallback untuk menghindari re-render
  const handleFinishTryout = useCallback(async () => {
    try {
      setIsFinished(true);

      // Convert userAnswers format to match API expectations
      const answersArray = Object.entries(userAnswers).map(
        ([questionIndex, selectedAnswer]) => {
          const question = questions[parseInt(questionIndex)];
          return {
            questionId: question._id, // Use actual question ID from database
            selectedAnswer: selectedAnswer,
          };
        }
      );

      // Calculate score
      let correctAnswers = 0;
      questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      // Calculate score for potential future use
      const score = Math.round((correctAnswers / questions.length) * 100);
      console.log(`Final score: ${score}%`);

      // Save user answers using the correct API format
      const resultData = {
        packageId: id,
        answers: answersArray,
      };

      const response = await fetch("/api/user-answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(resultData),
      });

      if (response.ok) {
        // Create result record
        const resultResponse = await fetch("/api/results", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ packageId: id }),
        });

        if (!resultResponse.ok) {
          console.error("Failed to save result");
        }

        // Redirect to results page after 3 seconds
        setTimeout(() => {
          setRedirecting(true);
          router.push(`/packages/${id}/results`);
        }, 3000);
      } else {
        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          console.error("Error saving answers:", errorData);
          throw new Error(errorData.error || "Failed to save answers");
        } else {
          throw new Error(
            `HTTP ${response.status}: Failed to save answers (non-JSON response)`
          );
        }
      }
    } catch (error) {
      console.error("Error finishing tryout:", error);
      setError("Failed to save your answers. Please try again.");
      setIsFinished(false); // Allow user to retry
    }
  }, [userAnswers, questions, id, router]);

  // Fetch questions and package data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ✅ First, check if user has already completed this tryout
        console.log("🔍 Checking if user has already completed this tryout...");
        setCheckingCompletion(true);

        try {
          // Check if user has result for this package
          const resultResponse = await fetch(`/api/results?packageId=${id}`, {
            credentials: "include",
          });

          console.log("🔍 Result API response status:", resultResponse.status);

          if (resultResponse.ok) {
            // Check if response is JSON before parsing
            const contentType = resultResponse.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              try {
                const resultData = await resultResponse.json();
                console.log("📊 Result check response:", resultData);

                // If user has a result, redirect to results page
                if (
                  resultData.success &&
                  resultData.results &&
                  resultData.results.length > 0
                ) {
                  console.log(
                    "✅ User has already completed this tryout, redirecting to results..."
                  );
                  setRedirecting(true);
                  setCheckingCompletion(false);
                  router.push(`/packages/${id}/results`);
                  return; // Stop execution
                }
              } catch (jsonError) {
                console.error(
                  "❌ Error parsing result response JSON:",
                  jsonError
                );
              }
            } else {
              console.warn(
                "⚠️ Results API returned non-JSON response, content-type:",
                contentType
              );
              // Try to read as text for debugging
              try {
                const textResponse = await resultResponse.text();
                console.warn(
                  "Response body:",
                  textResponse.substring(0, 200) + "..."
                );
              } catch {
                console.warn("Could not read response as text");
              }
            }
          } else if (resultResponse.status === 404) {
            console.log(
              "📭 No result found (404), user can proceed with tryout"
            );
          } else {
            console.warn(
              "⚠️ Result API returned error status:",
              resultResponse.status
            );
          }

          // Also check user answers as fallback
          const userAnswersResponse = await fetch(
            `/api/user-answers?packageId=${id}`,
            {
              credentials: "include",
            }
          );

          if (userAnswersResponse.ok) {
            // Check if response is JSON before parsing
            const contentType = userAnswersResponse.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const userAnswersData = await userAnswersResponse.json();
              console.log("📝 User answers check response:", userAnswersData);

              // If user has answers for this package, redirect to results page
              if (
                userAnswersData.userAnswers &&
                userAnswersData.userAnswers.length > 0
              ) {
                console.log(
                  "✅ User has answers for this tryout, redirecting to results..."
                );
                setRedirecting(true);
                setCheckingCompletion(false);
                router.push(`/packages/${id}/results`);
                return; // Stop execution
              }
            } else {
              console.warn("⚠️ User answers API returned non-JSON response");
            }
          }
        } catch (error) {
          console.log(
            "⚠️ Error checking completion status, proceeding with tryout:",
            error
          );
          // Continue with normal flow if check fails
        }

        setCheckingCompletion(false);
        console.log("🚀 User hasn't completed this tryout, proceeding...");

        // Fetch package data first
        const packageResponse = await fetch(`/api/packages/${id}`, {
          credentials: "include",
        });

        if (packageResponse.ok) {
          // Check if response is JSON before parsing
          const contentType = packageResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const packageData = await packageResponse.json();
            if (packageData.success) {
              setPackageData(packageData.data);
              setTimeLeft(packageData.data.duration * 60); // Convert to seconds
            }
          } else {
            console.warn("⚠️ Package API returned non-JSON response");
          }
        }

        // Fetch questions
        const questionsResponse = await fetch(
          `/api/questions?packageId=${id}`,
          {
            credentials: "include",
          }
        );

        if (!questionsResponse.ok) {
          throw new Error("Failed to fetch questions");
        }

        // Check if response is JSON before parsing
        const contentType = questionsResponse.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(
            "Questions API returned non-JSON response. Please check if the API is properly configured."
          );
        }

        const data = await questionsResponse.json();
        console.log("✅ Fetched questions data:", data);
        console.log("🔍 Data structure check:");
        console.log("- data.questions exists:", !!data.questions);
        console.log(
          "- data.questions is array:",
          Array.isArray(data.questions)
        );
        console.log("- data.questions length:", data.questions?.length);
        console.log("- Sample question structure:", {
          questionText: data.questions?.[0]?.questionText,
          optionA: data.questions?.[0]?.optionA,
          optionB: data.questions?.[0]?.optionB,
          images: data.questions?.[0]?.images,
          correctAnswer: data.questions?.[0]?.correctAnswer,
        });

        // Handle different response structures based on API response
        let questionData = [];
        if (data.questions && Array.isArray(data.questions)) {
          // Structure: { questions: [...], count: 30 }
          questionData = data.questions;
        } else if (data.data && Array.isArray(data.data)) {
          // Structure: { success: true, data: [...] }
          questionData = data.data;
        } else if (Array.isArray(data)) {
          // Direct array response
          questionData = data;
        } else {
          console.error("Unexpected API response structure:", data);
          throw new Error("Invalid questions data structure");
        }

        setQuestions(questionData);

        if (questionData.length === 0) {
          setError("No questions available for this package");
        } else {
          console.log("📋 Successfully loaded questions:", questionData.length);
          console.log("📝 First question preview:", {
            text: questionData[0]?.questionText?.substring(0, 50) + "...",
            hasImages: questionData[0]?.images?.length > 0,
            optionCount: [
              questionData[0]?.optionA,
              questionData[0]?.optionB,
              questionData[0]?.optionC,
              questionData[0]?.optionD,
              questionData[0]?.optionE,
            ].filter(Boolean).length,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // Timer countdown
  useEffect(() => {
    if (isStarted && !isFinished && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Call handleFinishTryout when time runs out
            handleFinishTryout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isStarted, isFinished, timeLeft, handleFinishTryout]);

  // ✅ Rest of the component remains exactly the same...
  const handleAnswerSelect = (selectedOption: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: selectedOption,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(userAnswers).length;
  };

  // Ubah semua tampilan teks ke Bahasa Indonesia
  if (redirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-lg text-center">
          <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tryout sudah diselesaikan
          </h2>
          <p className="text-gray-600 mb-6">
            Anda sudah menyelesaikan tryout ini. Mengarahkan ke halaman hasil...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {checkingCompletion
              ? "Memeriksa apakah Anda sudah menyelesaikan tryout ini..."
              : "Memuat tryout..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/my-package"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Kembali ke Paket Saya
          </Link>
        </div>
      </div>
    );
  }

  // Start screen
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-lg text-gray-600">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {packageData?.title || `Paket ${id}`}
          </h1>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Jumlah Soal:</span>
              <span className="font-medium">{questions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Durasi:</span>
              <span className="font-medium">
                {packageData?.duration || 60} menit
              </span>
            </div>
            <div className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg">
              <strong>Petunjuk:</strong>
              <ul className="mt-2 space-y-1">
                <li>• Baca setiap soal dengan teliti</li>
                <li>• Pilih jawaban yang paling tepat</li>
                <li>• Anda dapat berpindah antar soal</li>
                <li>• Kirim jawaban sebelum waktu habis</li>
              </ul>
            </div>
          </div>
          <button
            onClick={() => setIsStarted(true)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Mulai Tryout
          </button>
        </div>
      </div>
    );
  }

  // Finish screen
  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-lg text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tryout Selesai!
          </h2>
          <p className="text-gray-600 mb-6">
            Jawaban Anda telah disimpan. Anda akan diarahkan ke halaman hasil sebentar lagi.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Main tryout screen
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Tidak Ada Soal
          </h2>
          <p className="text-gray-600">
            Paket ini belum memiliki soal.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Info Debug:</p>
            <p>ID Paket: {id}</p>
            <p>Jumlah soal: {questions.length}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  // Debug log untuk current question
  if (currentQuestion) {
    const filteredImages =
      currentQuestion.images?.filter(
        (img) => !img.includes("res.cloudinary.com")
      ) || [];
    console.log("🎯 Current Question Debug:", {
      index: currentQuestionIndex,
      questionText: currentQuestion.questionText?.substring(0, 100) + "...",
      hasImages: currentQuestion.images?.length > 0,
      totalImageCount: currentQuestion.images?.length || 0,
      cloudinaryImages:
        (currentQuestion.images?.length || 0) - filteredImages.length,
      filteredImageCount: filteredImages.length,
      hasPassage: !!currentQuestion.passage && currentQuestion.passage.trim() !== '',
      passageLength: currentQuestion.passage?.length || 0,
      passagePreview: currentQuestion.passage?.substring(0, 100) + "...",
      optionA: !!currentQuestion.optionA,
      optionB: !!currentQuestion.optionB,
      optionC: !!currentQuestion.optionC,
      optionD: !!currentQuestion.optionD,
      optionE: !!currentQuestion.optionE,
      correctAnswer: currentQuestion.correctAnswer,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/packages/${id}`}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                {packageData?.title || `Paket ${id}`}
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-orange-600">
                <Clock className="w-5 h-5" />
                <span className="font-medium">{formatTime(timeLeft)}</span>
              </div>
              <div className="text-sm text-gray-600">
                {getAnsweredCount()}/{questions.length} terjawab
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>
                    Soal {currentQuestionIndex + 1} dari {questions.length}
                  </span>
                  <span>
                    {Math.round(
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    )}
                    % Selesai
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) / questions.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Reading Passage if available */}
              {currentQuestion?.passage &&
                currentQuestion.passage.trim() !== "" && (
                  <div className="mb-6">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Bacaan
                      </h3>
                      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {currentQuestion.passage}
                      </div>
                    </div>
                  </div>
                )}

              {/* Question */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {currentQuestion?.questionText || "Soal tidak tersedia"}
                </h2>

                {/* Question Images if available - filter out Cloudinary URLs */}
                {currentQuestion?.images &&
                  currentQuestion.images.length > 0 && (
                    <div className="mb-6 space-y-4">
                      {currentQuestion.images
                        .filter(
                          (imageUrl) => !imageUrl.includes("res.cloudinary.com")
                        )
                        .map((imageUrl, imageIndex) => (
                          <div key={imageIndex} className="relative">
                            <Image
                              src={imageUrl}
                              alt={`Question image ${imageIndex + 1}`}
                              width={600}
                              height={400}
                              className="rounded-lg shadow-sm max-w-full h-auto object-contain border border-gray-200"
                              onError={(e) => {
                                console.error(
                                  `Failed to load image: ${imageUrl}`
                                );
                                const target =
                                  e.currentTarget as HTMLImageElement;
                                target.src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY4NzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+";
                                target.alt = "Image not available";
                              }}
                            />
                          </div>
                        ))}
                    </div>
                  )}
              </div>

              {/* Answer Options */}
              <div className="space-y-3 mb-6 text-gray-600">
                {currentQuestion && (
                  <>
                    {/* Option A */}
                    {currentQuestion.optionA && (
                      <button
                        onClick={() => handleAnswerSelect("A")}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          userAnswers[currentQuestionIndex] === "A"
                            ? "border-blue-600 bg-blue-50 text-blue-900"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              userAnswers[currentQuestionIndex] === "A"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            A
                          </span>
                          <span className="flex-1">
                            {currentQuestion.optionA}
                          </span>
                        </div>
                      </button>
                    )}

                    {/* Option B */}
                    {currentQuestion.optionB && (
                      <button
                        onClick={() => handleAnswerSelect("B")}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          userAnswers[currentQuestionIndex] === "B"
                            ? "border-blue-600 bg-blue-50 text-blue-900"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              userAnswers[currentQuestionIndex] === "B"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            B
                          </span>
                          <span className="flex-1">
                            {currentQuestion.optionB}
                          </span>
                        </div>
                      </button>
                    )}

                    {/* Option C */}
                    {currentQuestion.optionC && (
                      <button
                        onClick={() => handleAnswerSelect("C")}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          userAnswers[currentQuestionIndex] === "C"
                            ? "border-blue-600 bg-blue-50 text-blue-900"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              userAnswers[currentQuestionIndex] === "C"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            C
                          </span>
                          <span className="flex-1">
                            {currentQuestion.optionC}
                          </span>
                        </div>
                      </button>
                    )}

                    {/* Option D */}
                    {currentQuestion.optionD && (
                      <button
                        onClick={() => handleAnswerSelect("D")}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          userAnswers[currentQuestionIndex] === "D"
                            ? "border-blue-600 bg-blue-50 text-blue-900"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              userAnswers[currentQuestionIndex] === "D"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            D
                          </span>
                          <span className="flex-1">
                            {currentQuestion.optionD}
                          </span>
                        </div>
                      </button>
                    )}

                    {/* Option E */}
                    {currentQuestion.optionE && (
                      <button
                        onClick={() => handleAnswerSelect("E")}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          userAnswers[currentQuestionIndex] === "E"
                            ? "border-blue-600 bg-blue-50 text-blue-900"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              userAnswers[currentQuestionIndex] === "E"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            E
                          </span>
                          <span className="flex-1">
                            {currentQuestion.optionE}
                          </span>
                        </div>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sebelumnya
                </button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={handleFinishTryout}
                    className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    Selesai Tryout
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Selanjutnya
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Navigasi Soal
              </h3>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((question, index) => {
                  const isAnswered = userAnswers.hasOwnProperty(index);
                  const isCurrent = index === currentQuestionIndex;
                  const hasPassage =
                    question.passage && question.passage.trim() !== "";

                  return (
                    <div key={index} className="relative">
                      <button
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          isCurrent
                            ? "bg-blue-600 text-white"
                            : isAnswered
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                      {/* Passage indicator */}
                      {hasPassage && (
                        <div
                          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"
                          title="This question has a reading passage"
                        >
                          <svg
                            className="w-2 h-2 text-white ml-0.5 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-gray-600">Saat ini</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-gray-600">Terjawab</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">Belum dijawab</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Ada bacaan</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleFinishTryout}
                className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                Kirim Tryout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
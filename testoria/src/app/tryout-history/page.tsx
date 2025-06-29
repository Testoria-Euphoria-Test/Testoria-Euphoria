"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { QuestionType } from "@/types/question";
import { UserAnswerType } from "@/types/userAnswer";
import { ResultType } from "@/types/result";

interface TryoutHistory {
  _id: string;
  packageId: string;
  packageTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  duration: number;
}

interface TryoutDetails {
  questions: QuestionType[];
  userAnswers: UserAnswerType[];
  isLoading: boolean;
  isExpanded: boolean;
}

export default function TryoutHistoryPage() {
  const [tryoutHistory, setTryoutHistory] = useState<TryoutHistory[]>([]);
  const [tryoutDetails, setTryoutDetails] = useState<
    Record<string, TryoutDetails>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTryoutDetails = async (packageId: string) => {
    if (tryoutDetails[packageId] && !tryoutDetails[packageId].isLoading) {
      return; // Already fetched or currently fetching
    }

    setTryoutDetails((prev) => ({
      ...prev,
      [packageId]: {
        questions: [],
        userAnswers: [],
        isLoading: true,
        isExpanded: false,
      },
    }));

    try {
      const [questionsResponse, userAnswersResponse] = await Promise.all([
        fetch(`/api/questions?packageId=${packageId}`),
        fetch(`/api/user-answers?packageId=${packageId}`),
      ]);

      let questions: QuestionType[] = [];
      let userAnswers: UserAnswerType[] = [];

      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        questions = questionsData.questions || [];
      } else {
        console.warn(`Failed to fetch questions for package ${packageId}`);
      }

      if (userAnswersResponse.ok) {
        const userAnswersData = await userAnswersResponse.json();
        userAnswers = userAnswersData.userAnswers || [];
      } else {
        console.warn(`Failed to fetch user answers for package ${packageId}`);
      }

      // Only use mock data if this is one of the demo packages and no real data is available
      if (
        questions.length === 0 &&
        (packageId === "pkg2" || packageId === "pkg5")
      ) {
        console.log(`Using demo data for package ${packageId}`);
        questions = generateMockQuestions(packageId);
        userAnswers = generateMockUserAnswers(packageId, questions);
      }

      setTryoutDetails((prev) => ({
        ...prev,
        [packageId]: {
          questions,
          userAnswers,
          isLoading: false,
          isExpanded: false,
        },
      }));
    } catch (error) {
      console.error(`Error fetching details for package ${packageId}:`, error);

      // Only use mock data for demo packages, otherwise show empty state
      let questions: QuestionType[] = [];
      let userAnswers: UserAnswerType[] = [];

      if (packageId === "pkg2" || packageId === "pkg5") {
        console.log(`Using demo data for package ${packageId} due to error`);
        questions = generateMockQuestions(packageId);
        userAnswers = generateMockUserAnswers(packageId, questions);
      }

      setTryoutDetails((prev) => ({
        ...prev,
        [packageId]: {
          questions,
          userAnswers,
          isLoading: false,
          isExpanded: false,
        },
      }));
    }
  };

  const generateMockQuestions = (packageId: string): QuestionType[] => {
    const baseQuestions = [
      {
        _id: `q1_${packageId}`,
        packageId,
        questionText: "Apa yang dimaksud dengan Pancasila?",
        optionA: "Dasar negara Indonesia",
        optionB: "Lambang negara Indonesia",
        optionC: "Bendera negara Indonesia",
        optionD: "Lagu kebangsaan Indonesia",
        optionE: "Bahasa resmi Indonesia",
        correctAnswer: "A" as const,
        explanation:
          "Pancasila adalah dasar negara Republik Indonesia yang terdiri dari lima sila sebagai pedoman hidup bangsa.",
        images: [],
      },
      {
        _id: `q2_${packageId}`,
        packageId,
        questionText: "Siapa proklamator kemerdekaan Indonesia?",
        optionA: "Joko Widodo dan Ma'ruf Amin",
        optionB: "Soekarno dan Mohammad Hatta",
        optionC: "Soeharto dan Try Sutrisno",
        optionD: "Megawati dan Hamzah Haz",
        optionE: "SBY dan Boediono",
        correctAnswer: "B" as const,
        explanation:
          "Soekarno dan Mohammad Hatta adalah proklamator kemerdekaan Indonesia pada tanggal 17 Agustus 1945.",
        images: [],
      },
      {
        _id: `q3_${packageId}`,
        packageId,
        questionText: "Berapa jumlah provinsi di Indonesia saat ini?",
        optionA: "32 provinsi",
        optionB: "33 provinsi",
        optionC: "34 provinsi",
        optionD: "35 provinsi",
        optionE: "38 provinsi",
        correctAnswer: "E" as const,
        explanation:
          "Indonesia saat ini memiliki 38 provinsi setelah pemekaran beberapa daerah dalam beberapa tahun terakhir.",
        images: [],
      },
    ];

    // Adjust number of questions based on package
    if (packageId === "pkg2") {
      return baseQuestions.slice(0, 3);
    } else if (packageId === "pkg5") {
      return [
        {
          _id: `q1_${packageId}`,
          packageId,
          questionText: "Berapa hasil dari 2² + 3² = ?",
          optionA: "10",
          optionB: "11",
          optionC: "12",
          optionD: "13",
          optionE: "14",
          correctAnswer: "D" as const,
          explanation: "2² = 4 dan 3² = 9, jadi 4 + 9 = 13",
          images: [],
        },
        {
          _id: `q2_${packageId}`,
          packageId,
          questionText: "Jika f(x) = 2x + 3, berapa nilai f(5)?",
          optionA: "11",
          optionB: "12",
          optionC: "13",
          optionD: "14",
          optionE: "15",
          correctAnswer: "C" as const,
          explanation: "f(5) = 2(5) + 3 = 10 + 3 = 13",
          images: [],
        },
      ];
    }

    return baseQuestions;
  };

  const generateMockUserAnswers = (
    packageId: string,
    questions: QuestionType[]
  ): UserAnswerType[] => {
    return questions.map((question, index) => {
      // Simulate some correct and some incorrect answers
      let selectedAnswer = question.correctAnswer;
      let isCorrect = true;

      // Make some answers wrong for demonstration
      if (packageId === "pkg2" && index === 1) {
        selectedAnswer = "A";
        isCorrect = false;
      } else if (packageId === "pkg5" && index === 0) {
        selectedAnswer = "B";
        isCorrect = false;
      }

      return {
        _id: `ua_${question._id}`,
        userId: "current_user",
        packageId,
        questionId: question._id!,
        selectedAnswer,
        isCorrect,
        createdAt: new Date().toISOString(),
      };
    });
  };

  const toggleTryoutDetails = (packageId: string) => {
    const details = tryoutDetails[packageId];

    if (!details) {
      fetchTryoutDetails(packageId);
    }

    setTryoutDetails((prev) => ({
      ...prev,
      [packageId]: {
        ...prev[packageId],
        isExpanded: !prev[packageId]?.isExpanded,
      },
    }));
  };

  const getUserAnswerForQuestion = (
    questionId: string,
    packageId: string
  ): UserAnswerType | undefined => {
    const details = tryoutDetails[packageId];
    if (!details) return undefined;
    return details.userAnswers.find(
      (answer) => answer.questionId === questionId
    );
  };

  const fetchTryoutHistory = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch real results data from API
      const resultsResponse = await fetch("/api/results");

      if (!resultsResponse.ok) {
        throw new Error("Failed to fetch tryout history");
      }

      const resultsData = await resultsResponse.json();

      if (!resultsData.success || !resultsData.results) {
        throw new Error("Invalid response format");
      }

      // Process the results and get package information
      const processedHistory = await Promise.all(
        resultsData.results.map(async (result: ResultType) => {
          try {
            // Get packageId as string (handle both string and ObjectId cases)
            const packageId = String(result.packageId);

            // Fetch package information to get the title
            const packageResponse = await fetch(`/api/packages/${packageId}`);
            let packageTitle = "Unknown Package";

            if (packageResponse.ok) {
              const packageData = await packageResponse.json();
              packageTitle =
                packageData.title ||
                packageData.data?.title ||
                "Unknown Package";
            }

            // Calculate total questions from the database
            const questionsResponse = await fetch(
              `/api/questions?packageId=${packageId}`
            );
            let totalQuestions = 0;

            if (questionsResponse.ok) {
              const questionsData = await questionsResponse.json();
              totalQuestions =
                questionsData.count || questionsData.questions?.length || 0;
            }

            return {
              _id: result._id || "",
              packageId: packageId,
              packageTitle,
              score: result.score || 0,
              totalQuestions: totalQuestions,
              correctAnswers: result.totalCorrect || 0,
              completedAt: result.createdAt || new Date().toISOString(),
              duration: result.durationTaken || 0,
            };
          } catch (error) {
            console.error(`Error processing result ${result._id}:`, error);
            // Return fallback data for this result
            const packageId = String(result.packageId);
            return {
              _id: result._id || "",
              packageId: packageId,
              packageTitle: "Unknown Package",
              score: result.score || 0,
              totalQuestions:
                (result.totalCorrect || 0) +
                (result.totalWrong || 0) +
                (result.totalUnanswered || 0),
              correctAnswers: result.totalCorrect || 0,
              completedAt: result.createdAt || new Date().toISOString(),
              duration: result.durationTaken || 0,
            };
          }
        })
      );

      setTryoutHistory(processedHistory);

      // Clear any previous error if successful
      if (error) {
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching tryout history:", err);

      // Fallback to mock data if API fails
      console.log("Falling back to demo data...");
      const mockData: TryoutHistory[] = [
        {
          _id: "demo1",
          packageId: "pkg2",
          packageTitle: "CPNS 2024 - Tes Wawasan Kebangsaan (Demo)",
          score: 67,
          totalQuestions: 3,
          correctAnswers: 2,
          completedAt: "2024-12-20T10:30:00Z",
          duration: 15,
        },
        {
          _id: "demo2",
          packageId: "pkg5",
          packageTitle: "Olimpiade Matematika SMA (Demo)",
          score: 50,
          totalQuestions: 2,
          correctAnswers: 1,
          completedAt: "2024-12-15T14:20:00Z",
          duration: 10,
        },
      ];

      setTryoutHistory(mockData);
      setError(
        "Could not load your actual tryout history. Showing demo data instead."
      );
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchTryoutHistory();
  }, [fetchTryoutHistory]);

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getScoreColor = (score: number) => {
    if (isNaN(score) || score === null || score === undefined)
      return "text-gray-600";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // ✅ Add safe number formatting
  const safeNumber = (value: unknown, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  };

  // ✅ Add safe array length
  const historyCount = Array.isArray(tryoutHistory) ? tryoutHistory.length : 0;

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tryout history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchTryoutHistory}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/dashboard-customer"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Tryout History
                  </h1>
                  <p className="text-gray-600">
                    Review your test performance and track your progress over
                    time.
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {historyCount} attempts
                </span>
              </div>

              {/* Error/Demo Data Notice */}
              {error && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {historyCount === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Tryout History
                  </h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                    You haven&apos;t completed any tryouts yet. Start practicing
                    to see your results here.
                  </p>
                  <Link
                    href="/dashboard-customer"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                  >
                    Browse Packages
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {tryoutHistory.map((tryout) => {
                    const details = tryoutDetails[tryout.packageId];
                    const isExpanded = details?.isExpanded || false;
                    const isLoadingDetails = details?.isLoading || false;

                    return (
                      <div
                        key={tryout._id}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200"
                      >
                        {/* Main tryout summary */}
                        <div className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {tryout.packageTitle || "Unknown Package"}
                                </h4>
                                <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                  Score: {safeNumber(tryout.score)}%
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500 font-medium">
                                    Score:
                                  </span>
                                  <p
                                    className={`font-bold text-xl md:text-2xl ${getScoreColor(
                                      tryout.score
                                    )}`}
                                  >
                                    {safeNumber(tryout.score)}%
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">
                                    Correct Answers:
                                  </span>
                                  <p className="font-semibold text-gray-900">
                                    {safeNumber(tryout.correctAnswers)}/
                                    {safeNumber(tryout.totalQuestions)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">
                                    Duration:
                                  </span>
                                  <p className="font-semibold text-gray-900">
                                    {safeNumber(tryout.duration)} minutes
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">
                                    Completed:
                                  </span>
                                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                                    {formatDateTime(tryout.completedAt)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Expand/Collapse Button */}
                            <button
                              onClick={() =>
                                toggleTryoutDetails(tryout.packageId)
                              }
                              className="self-start sm:ml-4 flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              disabled={isLoadingDetails}
                            >
                              {isLoadingDetails ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                  <span>Loading...</span>
                                </>
                              ) : (
                                <>
                                  <span>
                                    {isExpanded
                                      ? "Hide Details"
                                      : "View Details"}
                                  </span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expandable question details */}
                        {isExpanded && details && (
                          <div className="border-t border-gray-100 bg-gray-50">
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="text-lg font-semibold text-gray-900">
                                  Question Review
                                </h5>
                                <div className="text-sm text-gray-600">
                                  {details.questions.length} question
                                  {details.questions.length !== 1
                                    ? "s"
                                    : ""} •{" "}
                                  {
                                    details.userAnswers.filter(
                                      (ua) => ua.isCorrect
                                    ).length
                                  }{" "}
                                  correct
                                </div>
                              </div>

                              {details.questions.length === 0 ? (
                                <div className="text-center py-8">
                                  <p className="text-gray-500">
                                    No questions found for this tryout.
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                  {details.questions.map((question, index) => {
                                    const userAnswer = getUserAnswerForQuestion(
                                      question._id!,
                                      tryout.packageId
                                    );
                                    const isCorrect =
                                      userAnswer?.isCorrect || false;

                                    return (
                                      <div
                                        key={question._id}
                                        className="bg-white rounded-lg p-4 border border-gray-200"
                                      >
                                        <div className="flex items-start space-x-3">
                                          <div className="flex-shrink-0">
                                            {isCorrect ? (
                                              <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                                            ) : (
                                              <XCircle className="w-5 h-5 text-red-500 mt-1" />
                                            )}
                                          </div>

                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                              <span className="text-sm font-medium text-gray-500">
                                                Question {index + 1}
                                              </span>
                                              <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                  isCorrect
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}
                                              >
                                                {isCorrect
                                                  ? "Correct"
                                                  : "Incorrect"}
                                              </span>
                                            </div>

                                            <p className="text-gray-900 font-medium mb-3">
                                              {question.questionText}
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                              <div>
                                                <span className="text-gray-500 font-medium">
                                                  Your Answer:
                                                </span>
                                                <p
                                                  className={`font-semibold ${
                                                    isCorrect
                                                      ? "text-green-600"
                                                      : "text-red-600"
                                                  }`}
                                                >
                                                  {userAnswer?.selectedAnswer
                                                    ? `${
                                                        userAnswer.selectedAnswer
                                                      }. ${
                                                        question[
                                                          `option${userAnswer.selectedAnswer}` as keyof QuestionType
                                                        ] as string
                                                      }`
                                                    : "No answer recorded"}
                                                </p>
                                              </div>
                                              <div>
                                                <span className="text-gray-500 font-medium">
                                                  Correct Answer:
                                                </span>
                                                <p className="font-semibold text-green-600">
                                                  {question.correctAnswer}.{" "}
                                                  {
                                                    question[
                                                      `option${question.correctAnswer}` as keyof QuestionType
                                                    ] as string
                                                  }
                                                </p>
                                              </div>
                                            </div>

                                            {question.explanation && (
                                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                <span className="text-blue-800 font-medium text-sm">
                                                  Explanation:
                                                </span>
                                                <p className="text-blue-700 text-sm mt-1">
                                                  {question.explanation}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

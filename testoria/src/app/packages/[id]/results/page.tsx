"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  Target,
  BookOpen,
  Trophy,
  AlertCircle,
  Brain,
  ArrowLeft,
} from "lucide-react";
import { formatAIFeedback } from "@/helpers/formatFeedback";

interface ResultData {
  _id: string;
  userId: string;
  packageId: string;
  score: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  durationTaken: number;
  feedback: string;
  createdAt: string;
}

interface AnswerDetail {
  _id: string;
  userId: string;
  packageId: string;
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  createdAt: string;
  question?: {
    _id: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    optionE: string;
    correctAnswer: string;
    explanation: string;
    images: string[];
  };
}

interface Package {
  _id: string;
  title: string;
  description: string;
  duration: number;
}

interface Question {
  _id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: string;
  explanation: string;
  images: string[];
}

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: packageId } = use(params);

  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [answerDetails, setAnswerDetails] = useState<AnswerDetail[]>([]);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [generatingAIFeedback, setGeneratingAIFeedback] = useState(false);
  const [aiFeedbackSuccess, setAiFeedbackSuccess] = useState(false);

  useEffect(() => {
    const fetchDetailedAnswers = async () => {
      try {
        // Fetch detailed answers
        const answersResponse = await fetch(
          `/api/user-answers?packageId=${packageId}`,
          {
            credentials: "include",
          }
        );

        if (answersResponse.ok) {
          const answersData = await answersResponse.json();
          console.log("📝 Answers data:", answersData);

          // Fetch all questions for this package
          const questionsResponse = await fetch(
            `/api/questions?packageId=${packageId}`,
            { credentials: "include" }
          );

          if (questionsResponse.ok) {
            const questionsData = await questionsResponse.json();
            console.log("📋 Questions data:", questionsData);

            // Extract questions array from different possible structures
            let questions: Question[] = [];
            if (
              questionsData.questions &&
              Array.isArray(questionsData.questions)
            ) {
              questions = questionsData.questions;
            } else if (
              questionsData.data &&
              Array.isArray(questionsData.data)
            ) {
              questions = questionsData.data;
            } else if (Array.isArray(questionsData)) {
              questions = questionsData;
            }

            // Get user answers and enrich with question details
            const userAnswers =
              answersData.userAnswers || answersData.data || [];

            const enrichedAnswers = userAnswers.map((answer: AnswerDetail) => {
              const question = questions.find(
                (q: Question) => q._id === answer.questionId
              );
              return { ...answer, question };
            });

            setAnswerDetails(enrichedAnswers);
          } else {
            console.warn("Failed to fetch questions for enrichment");
            // Still set answers even without question details
            setAnswerDetails(answersData.userAnswers || answersData.data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching detailed answers:", error);
      }
    };

    const calculateFallbackResult = async () => {
      try {
        console.log("🔄 Calculating fallback result from user answers...");
        setUsingFallbackData(true);

        const answersResponse = await fetch(
          `/api/user-answers?packageId=${packageId}`,
          { credentials: "include" }
        );

        console.log("📝 User answers response status:", answersResponse.status);

        if (answersResponse.ok) {
          // Check if response is JSON before parsing
          const contentType = answersResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            try {
              const answersData = await answersResponse.json();
              console.log("📝 User answers data:", answersData);

              if (
                answersData.userAnswers &&
                answersData.userAnswers.length > 0
              ) {
                // Calculate results from user answers
                const userAnswers = answersData.userAnswers;
                const totalCorrect = userAnswers.filter(
                  (a: AnswerDetail) => a.isCorrect
                ).length;
                const totalWrong = userAnswers.filter(
                  (a: AnswerDetail) => !a.isCorrect
                ).length;
                const totalAnswered = userAnswers.length;

                // Get total questions from questions API
                const questionsResponse = await fetch(
                  `/api/questions?packageId=${packageId}`,
                  { credentials: "include" }
                );

                let totalQuestions = totalAnswered; // fallback
                let questions: Question[] = []; // Initialize questions array
                if (questionsResponse.ok) {
                  const questionsData = await questionsResponse.json();
                  if (
                    questionsData.questions &&
                    Array.isArray(questionsData.questions)
                  ) {
                    questions = questionsData.questions;
                  } else if (
                    questionsData.data &&
                    Array.isArray(questionsData.data)
                  ) {
                    questions = questionsData.data;
                  } else if (Array.isArray(questionsData)) {
                    questions = questionsData;
                  }
                  totalQuestions = questions.length;
                }

                const totalUnanswered = totalQuestions - totalAnswered;
                const score =
                  totalQuestions > 0
                    ? Math.round((totalCorrect / totalQuestions) * 100)
                    : 0;

                // Generate AI feedback based on user answers and questions
                let aiFeedback = "";
                if (questions.length > 0) {
                  try {
                    console.log("🤖 Generating AI feedback...");
                    setGeneratingAIFeedback(true);
                    const feedbackResponse = await fetch("/api/test-ai", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      credentials: "include",
                      body: JSON.stringify({
                        questions: questions,
                        answers: userAnswers,
                        score: score,
                      }),
                    });

                    if (feedbackResponse.ok) {
                      const feedbackData = await feedbackResponse.json();
                      if (feedbackData.success && feedbackData.feedback) {
                        aiFeedback = feedbackData.feedback;
                        setAiFeedbackSuccess(true);
                        console.log("✅ AI feedback generated successfully");
                      } else {
                        console.warn("⚠️ AI feedback API returned no feedback");
                      }
                    } else {
                      console.warn(
                        "⚠️ AI feedback API failed:",
                        feedbackResponse.status
                      );
                    }
                  } catch (aiError) {
                    console.error("❌ Error generating AI feedback:", aiError);
                  } finally {
                    setGeneratingAIFeedback(false);
                  }
                } else {
                  console.warn(
                    "⚠️ No questions available for AI feedback generation"
                  );
                }

                // Fallback feedback if AI fails
                const fallbackFeedback =
                  score >= 80
                    ? "Excellent work! You demonstrated strong understanding of the material."
                    : score >= 60
                      ? "Good effort! Consider reviewing the topics you missed to strengthen your knowledge."
                      : "Keep practicing! Review the material and try again to improve your understanding.";

                // Create fallback result data with AI feedback or fallback
                const fallbackResult: ResultData = {
                  _id: "fallback",
                  userId: "current-user",
                  packageId,
                  score,
                  totalCorrect,
                  totalWrong,
                  totalUnanswered,
                  durationTaken: packageData?.duration || 0,
                  feedback: aiFeedback || fallbackFeedback,
                  createdAt: new Date().toISOString(),
                };

                setResultData(fallbackResult);

                // Also fetch detailed answers
                await fetchDetailedAnswers();
                return; // Success, exit function
              } else {
                console.warn("⚠️ No user answers found in response");
                throw new Error(
                  "No tryout data found. Please complete a tryout first."
                );
              }
            } catch (jsonError) {
              console.error("❌ Error parsing user answers JSON:", jsonError);
              throw new Error("Invalid response format from user answers API");
            }
          } else {
            console.warn("⚠️ User answers API returned non-JSON response");
            throw new Error(
              "User answers API returned invalid response format"
            );
          }
        } else if (answersResponse.status === 404) {
          console.warn("📭 No user answers found (404)");
          throw new Error(
            "No tryout data found. Please complete the tryout first."
          );
        } else if (answersResponse.status === 401) {
          console.warn("🔐 Authentication required");
          // Redirect to login
          window.location.href = "/login";
          return;
        } else {
          console.error("❌ User answers API error:", answersResponse.status);
          // Try to read error message from response
          try {
            const errorText = await answersResponse.text();
            console.error("Error response:", errorText);
          } catch {
            // Ignore if can't read response
          }
          throw new Error(
            `Failed to fetch user answers (HTTP ${answersResponse.status}). Please try again.`
          );
        }
      } catch (error) {
        console.error("Error calculating fallback result:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load results"
        );
      }
    };

    const fetchResultData = async () => {
      try {
        setLoading(true);

        console.log("🔍 Fetching results for packageId:", packageId);

        // First, get package info
        const packageResponse = await fetch(`/api/packages/${packageId}`, {
          credentials: "include",
        });

        if (packageResponse.ok) {
          const packageInfo = await packageResponse.json();
          if (packageInfo.success) {
            setPackageData(packageInfo.data);
          }
        }

        // Fetch latest result for this package
        const resultResponse = await fetch(
          `/api/results?packageId=${packageId}`,
          {
            credentials: "include",
          }
        );

        console.log("📊 Result response status:", resultResponse.status);

        if (resultResponse.ok) {
          // Check if response is JSON before parsing
          const contentType = resultResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            try {
              const resultData = await resultResponse.json();
              console.log("📊 Result data:", resultData);

              if (
                resultData.success &&
                resultData.results &&
                resultData.results.length > 0
              ) {
                // Use the first result (latest)
                const latestResult = resultData.results[0];
                setResultData(latestResult);

                // Fetch detailed answers
                await fetchDetailedAnswers();
                return; // Exit early if we have result data
              } else {
                console.log(
                  "📭 No result found, attempting fallback calculation..."
                );
              }
            } catch (jsonError) {
              console.error(
                "❌ Error parsing result response JSON:",
                jsonError
              );
              console.log("🔄 Attempting fallback calculation...");
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
            console.log("🔄 Attempting fallback calculation...");
          }
        } else if (resultResponse.status === 401) {
          console.warn("🔐 Authentication required");
          // Redirect to login
          window.location.href = "/login";
          return;
        } else {
          console.warn(
            "⚠️ Result API returned error status:",
            resultResponse.status
          );
          console.log("🔄 Attempting fallback calculation...");
        }

        // Fallback: Calculate result from user answers
        await calculateFallbackResult();
      } catch (error) {
        console.error("Error fetching result data:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load results";

        // Check if it's an auth error
        if (
          errorMessage.includes("Authentication") ||
          errorMessage.includes("login")
        ) {
          setError("Please login to view your results.");
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResultData();
  }, [packageId, packageData?.duration]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Results
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            {error.includes("login") ? (
              <>
                <Link
                  href="/login"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/packages"
                  className="block text-blue-600 hover:text-blue-800"
                >
                  Back to Packages
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`/packages/${packageId}/tryout`}
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Take Tryout
                </Link>
                <Link
                  href="/packages"
                  className="block text-blue-600 hover:text-blue-800"
                >
                  Back to Packages
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Results Found
          </h1>
          <p className="text-gray-600 mb-6">
            You haven&apos;t completed this tryout yet.
          </p>
          <Link
            href={`/packages/${packageId}/tryout`}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Tryout
          </Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard-customer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Packages
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Tryout Results</h1>
          {packageData && (
            <p className="text-gray-600 mt-2">{packageData.title}</p>
          )}
        </div>

        {/* Score Overview */}
        <div
          className={`rounded-lg p-6 mb-8 ${getScoreBgColor(resultData.score)}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Score</h2>
              <p
                className={`text-4xl font-bold ${getScoreColor(
                  resultData.score
                )}`}
              >
                {resultData.score}%
              </p>
            </div>
            <Trophy
              className={`h-16 w-16 ${getScoreColor(resultData.score)}`}
            />
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Correct</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resultData.totalCorrect}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Wrong</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resultData.totalWrong}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-gray-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Unanswered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resultData.totalUnanswered}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resultData.durationTaken} min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Feedback */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8 border border-gray-100">
          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-lg mr-4 flex-shrink-0">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  Analisis & Umpan Balik AI
                </h3>
                {generatingAIFeedback && (
                  <div className="flex items-center text-blue-600 text-sm bg-blue-50 px-3 py-2 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Menganalisis jawaban Anda...
                  </div>
                )}
              </div>

              {resultData.feedback ? (
                <div className="space-y-4 animate-fadeIn">
                  {formatAIFeedback(resultData.feedback).map(
                    (section, index) => (
                      <div
                        key={index}
                        className={`${section.bgColor} border-l-4 ${section.borderColor} p-4 rounded-r-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.01]`}
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <div className="flex items-start">
                          {section.icon === "CheckCircle" && (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                          )}
                          {section.icon === "Target" && (
                            <Target className="h-5 w-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                          )}
                          {section.icon === "BookOpen" && (
                            <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                          )}
                          {section.icon === "Trophy" && (
                            <Trophy className="h-5 w-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
                          )}
                          {section.icon === "Brain" && (
                            <Brain className="h-5 w-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <h4
                              className={`${section.textColor} font-semibold mb-3 text-base`}
                            >
                              {section.title}
                            </h4>
                            <div className={`${section.textColor} space-y-3`}>
                              {section.content.map((text, idx) => {
                                // Check if this is a checklist item
                                const isChecklistItem = text.trim().startsWith('□');
                                const cleanText = text.replace(/^□\s*/, '').trim();

                                return (
                                  <div
                                    key={idx}
                                    className="flex items-start group"
                                  >
                                    {isChecklistItem ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-gray-400 rounded mt-1 mr-3 flex-shrink-0 group-hover:border-gray-600 transition-colors duration-200"></div>
                                        <p className="text-sm leading-relaxed font-medium group-hover:text-opacity-90 transition-colors duration-200">
                                          {cleanText}
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <span
                                          className={`w-2 h-2 ${section.accentColor} rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-125 transition-transform duration-200`}
                                        ></span>
                                        <p className="text-sm leading-relaxed font-medium group-hover:text-opacity-90 transition-colors duration-200">
                                          {cleanText}{cleanText.endsWith('.') ? '' : '.'}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : generatingAIFeedback ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <div className="animate-pulse">
                    <div className="inline-block w-8 h-8 bg-blue-200 rounded-full mb-3"></div>
                    <p className="text-blue-700 font-medium">
                      Sedang menganalisis jawaban Anda dengan AI...
                    </p>
                    <p className="text-blue-600 text-sm mt-1">
                      Ini mungkin memakan waktu beberapa detik
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <Brain className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">
                    Feedback AI tidak tersedia saat ini
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Silakan coba lagi nanti
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Answers */}
        {answerDetails.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Detailed Review
              </h3>
              <p className="text-gray-600 mt-1">
                Review your answers and explanations
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {answerDetails.map((answer, index) => (
                <div key={answer._id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                      Question {index + 1}
                    </h4>
                    <div className="flex items-center">
                      {answer.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span
                        className={`ml-2 text-sm font-medium ${answer.isCorrect ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {answer.isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>
                  </div>

                  {answer.question && (
                    <>
                      <p className="text-gray-900 mb-4">
                        {answer.question.questionText}
                      </p>

                      <div className="space-y-2 mb-4">
                        {["A", "B", "C", "D", "E"].map((option) => {
                          const optionKey =
                            `option${option}` as keyof typeof answer.question;
                          const optionText = answer.question?.[optionKey];

                          if (!optionText) return null;

                          const isSelected = answer.selectedAnswer === option;
                          const isCorrect =
                            answer.question?.correctAnswer === option;

                          return (
                            <div
                              key={option}
                              className={`p-3 rounded-lg border ${isCorrect
                                  ? "bg-green-50 border-green-200"
                                  : isSelected
                                    ? "bg-red-50 border-red-200"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                            >
                              <div className="flex items-center">
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium mr-3 ${isCorrect
                                      ? "bg-green-600 text-white"
                                      : isSelected
                                        ? "bg-red-600 text-white"
                                        : "bg-gray-300 text-gray-700"
                                    }`}
                                >
                                  {option}
                                </span>
                                <span className="text-gray-900">
                                  {optionText}
                                </span>
                                {isSelected && !isCorrect && (
                                  <span className="ml-auto text-sm text-red-600">
                                    Your answer
                                  </span>
                                )}
                                {isCorrect && (
                                  <span className="ml-auto text-sm text-green-600">
                                    Correct answer
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {answer.question.explanation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-medium text-blue-900 mb-2">
                            Explanation:
                          </h5>
                          <p className="text-blue-800">
                            {answer.question.explanation}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {!answer.question && (
                    <div className="text-gray-500 italic">
                      Question details not available
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard-customer"
            className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse More Packages
          </Link>
          <Link
            href="/dashboard-customer"
            className="flex-1 bg-gray-600 text-white text-center py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

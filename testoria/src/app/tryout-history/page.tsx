"use client";

import { useState, useEffect } from "react";
import { FileText, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

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

export default function TryoutHistoryPage() {
  const [tryoutHistory, setTryoutHistory] = useState<TryoutHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTryoutHistory();
  }, []);

  const fetchTryoutHistory = async () => {
    try {
      setLoading(true);
      // Since there's no API endpoint yet, use mock data
      // In real implementation, replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      const mockData: TryoutHistory[] = [
        {
          _id: "try1",
          packageId: "pkg2",
          packageTitle: "CPNS 2024 - Tes Wawasan Kebangsaan",
          score: 85,
          totalQuestions: 100,
          correctAnswers: 85,
          completedAt: "2024-02-20T10:30:00Z",
          duration: 85,
        },
        {
          _id: "try2",
          packageId: "pkg5",
          packageTitle: "Olimpiade Matematika SMA",
          score: 72,
          totalQuestions: 50,
          correctAnswers: 36,
          completedAt: "2024-03-15T14:20:00Z",
          duration: 220,
        },
        {
          _id: "try3",
          packageId: "pkg2",
          packageTitle: "CPNS 2024 - Tes Wawasan Kebangsaan",
          score: 91,
          totalQuestions: 100,
          correctAnswers: 91,
          completedAt: "2024-03-22T11:45:00Z",
          duration: 78,
        },
      ];

      setTryoutHistory(mockData);
    } catch (err) {
      console.error("Error fetching tryout history:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
  const safeNumber = (value: any, fallback: number = 0): number => {
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
                  {tryoutHistory.map((tryout) => (
                    <div
                      key={tryout._id}
                      className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
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
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 font-medium">
                                Score:
                              </span>
                              <p
                                className={`font-bold text-2xl ${getScoreColor(
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
                              <p className="font-semibold text-gray-900">
                                {formatDateTime(tryout.completedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

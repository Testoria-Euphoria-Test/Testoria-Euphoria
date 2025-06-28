"use client";

import { useState, useEffect } from "react";
import { Package, Calendar, Clock, User } from "lucide-react";
import PackageResponse from "@/types/PackageResponse";


export default function MyPackage() {
  const [myPackages, setMyPackages] = useState<PackageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyPackages();
  }, []);

  const fetchMyPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch paid payments with package details
      const response = await fetch("/api/payments?status=paid", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch your packages");
      }

      const payments = await response.json();
      setMyPackages(payments);
    } catch (err) {
      console.error("Error fetching my packages:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "GRATIS";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleStartTryout = (packageId: string) => {
    // Navigate to tryout page
    window.location.href = `/packages/${packageId}/tryout`;
  };

  const handleViewDetail = (packageId: string) => {
    // Navigate to package detail
    window.location.href = `/packages/${packageId}`;
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your packages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Package className="w-12 h-12 text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Failed to Load Packages
        </h3>
        <p className="text-gray-600 text-lg max-w-md mx-auto mb-4">{error}</p>
        <button
          onClick={fetchMyPackages}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (myPackages.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          No Packages Yet
        </h3>
        <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
          You haven't purchased any packages yet. Browse available packages to
          get started with your test preparation.
        </p>
        <button
          onClick={() => (window.location.href = "/dashboard-customer")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Packages
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">My Packages</h3>
          <p className="text-gray-600">
            Packages you've purchased and can access anytime
          </p>
        </div>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {myPackages.length} Package{myPackages.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myPackages.map((packageItem) => (
          <div
            key={packageItem._id}
            className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden group"
          >
            {/* Package Header */}
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {packageItem.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {packageItem.categoryName && (
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        {packageItem.categoryName}
                      </div>
                    )}
                    {packageItem.creatorName && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {packageItem.creatorName}
                      </div>
                    )}
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  OWNED
                </span>
              </div>

              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {packageItem.description}
              </p>

              {/* Package Meta Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{packageItem.duration} minutes</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatCurrency(packageItem.price)}</span>
                </div>
              </div>
            </div>

            {/* Purchase Info */}
            <div className="px-6 py-3 bg-green-50 border-b border-green-100">
              <div className="text-xs text-green-700">
                <span className="font-medium">Purchased:</span>{" "}
                {formatDateTime(packageItem.paymentDate)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6">
              <div className="space-y-3">
                <button
                  onClick={() => handleStartTryout(packageItem._id)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🚀 Start Tryout
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleViewDetail(packageItem._id)}
                    className="py-2 px-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() =>
                      (window.location.href = `/packages/${packageItem._id}/results`)
                    }
                    className="py-2 px-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    View Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {myPackages.length}
            </div>
            <div className="text-sm text-gray-600">Total Packages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {myPackages.reduce((total, pkg) => total + pkg.duration, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(
                myPackages.reduce((total, pkg) => total + pkg.price, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Total Investment</div>
          </div>
        </div>
      </div>
    </div>
  );
}

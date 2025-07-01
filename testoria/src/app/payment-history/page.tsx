"use client";

import { useState, useEffect } from "react";
import { CreditCard, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface PaymentHistory {
  _id: string;
  packageId: string;
  packageTitle: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  paymentDate?: string;
  createdAt: string;
  package?: {
    title: string;
  };
}

export default function PaymentHistoryPage() {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payments", {
        credentials: "include",
      });

      if (response.ok) {
        const payments = await response.json();
        setPaymentHistory(payments);
        console.log("Fetched payment history:", payments);
      } else {
        throw new Error("Failed to fetch payment history");
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
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
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      case "pending":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
      case "failed":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Berhasil";
      case "pending":
        return "Pending";
      case "failed":
        return "Gagal";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat riwayat pembayaran...</p>
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
            <h2 className="text-xl font-bold text-red-600 mb-2">Kesalahan</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchPaymentHistory}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
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
              Kembali ke Dashboard
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Riwayat Pembayaran
                  </h1>
                  <p className="text-gray-600">
                    Lacak semua transaksi pembayaran dan riwayat pembelian Anda.
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {paymentHistory.length} transaksi
                </span>
              </div>

              {paymentHistory.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CreditCard className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Tidak Ada Riwayat Pembayaran
                  </h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                    Anda belum melakukan pembayaran apapun. Mulai dengan membeli
                    paket untuk melihat riwayat pembayaran Anda di sini.
                  </p>
                  <Link
                    href="/dashboard-customer"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                  >
                    Jelajahi Paket
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment._id}
                      className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            <h4 className="text-lg font-semibold text-gray-900">
                              Pembelian Paket
                            </h4>
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusBadge(
                                payment.status
                              )}`}
                            >
                              {getStatusText(payment.status)}
                            </span>
                          </div>

                          <div className="mb-4">
                            <span className="text-gray-500 font-medium text-sm">
                              Paket:
                            </span>
                            <h3 className="text-xl font-bold text-blue-600 mt-1">
                              {payment.package?.title}
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 font-medium">
                                Jumlah:
                              </span>
                              <p className="font-bold text-gray-900">
                                {formatCurrency(payment.amount)}
                              </p>
                            </div>
                            <div></div>
                            <div>
                              <span className="text-gray-500 font-medium">
                                Tanggal:
                              </span>
                              <p className="font-semibold text-gray-900">
                                {payment.paymentDate
                                  ? formatDateTime(payment.paymentDate)
                                  : payment.status === "pending"
                                  ? "Menunggu pembayaran"
                                  : "Belum dibayar"}
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

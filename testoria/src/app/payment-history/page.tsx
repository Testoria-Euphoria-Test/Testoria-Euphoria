"use client";

import { useState, useEffect } from "react";
import { CreditCard, BookOpen, FileText, BookDashedIcon } from "lucide-react";
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
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-8 w-8 border-2"
              style={{
                borderColor: "#1e3a8a",
                borderTopColor: "transparent",
                margin: "0 auto",
              }}
            ></div>
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Kesalahan</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchPaymentHistory}
              className="px-6 py-3"
              style={{
                backgroundColor: "#1e3a8a",
                color: "#fff",
                borderRadius: "9999px",
                fontWeight: 500,
                transition: "background 0.2s",
              }}
              onMouseOver={e =>
                ((e.target as HTMLButtonElement).style.backgroundColor =
                  "#243c5a")
              }
              onMouseOut={e =>
                ((e.target as HTMLButtonElement).style.backgroundColor =
                  "#1e3a8a")
              }
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Navigation Cards Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard-customer"
            className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md hover:border-gray-300 transition-all duration-200"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-200 transition-colors">
              <BookDashedIcon className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Dashboard</h3>
            <p className="text-gray-600 text-sm">Beranda Utama</p>
          </Link>

          <Link
            href="/my-package"
            className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md hover:border-gray-300 transition-all duration-200"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-200 transition-colors">
              <BookOpen className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">My Paket</h3>
            <p className="text-gray-600 text-sm">Paket Saya</p>
          </Link>

          <Link
            href="/payment-history"
            className="group bg-white rounded-lg shadow-sm border-2 border-gray-900 p-6 text-center hover:shadow-md transition-all duration-200"
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: "#1e3a8a" }}
            >
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Pembayaran</h3>
            <p className="text-gray-600 text-sm">Riwayat Transaksi</p>
          </Link>

          <Link
            href="/tryout-history"
            className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md hover:border-gray-300 transition-all duration-200"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-200 transition-colors">
              <FileText className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Tryout</h3>
            <p className="text-gray-600 text-sm">Riwayat Ujian</p>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Section Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#1e3a8a" }}
                >
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Riwayat Pembayaran
                  </h2>
                  <p className="text-gray-600">
                    Lacak semua transaksi pembayaran dan riwayat pembelian Anda
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Container */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Riwayat Pembayaran
            </h1>
            <p className="text-gray-600">
              Lacak semua transaksi pembayaran dan riwayat pembelian Anda
            </p>
            <div className="mt-4">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: "#e0e7ff",
                  color: "#1e3a8a",
                }}
              >
                {paymentHistory.length} transaksi
              </span>
            </div>
          </div>

          {paymentHistory.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#e0e7ff" }}
              >
                <CreditCard className="w-8 h-8" style={{ color: "#1e3a8a" }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tidak Ada Riwayat Pembayaran
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                Anda belum melakukan pembayaran apapun. Mulai dengan membeli
                paket untuk melihat riwayat pembayaran Anda di sini.
              </p>
              <Link
                href="/dashboard-customer"
                className="inline-flex items-center px-6 py-3 font-medium rounded-full"
                style={{
                  backgroundColor: "#1e3a8a",
                  color: "#fff",
                  transition: "background 0.2s",
                }}
                onMouseOver={e =>
                  ((e.target as HTMLAnchorElement).style.backgroundColor =
                    "#243c5a")
                }
                onMouseOut={e =>
                  ((e.target as HTMLAnchorElement).style.backgroundColor =
                    "#1e3a8a")
                }
              >
                Jelajahi Paket
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div
                  key={payment._id}
                  className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "#e0e7ff" }}
                        >
                          <CreditCard
                            className="w-5 h-5"
                            style={{ color: "#1e3a8a" }}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Pembelian Paket
                          </h4>
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                              payment.status
                            )}`}
                          >
                            {getStatusText(payment.status)}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {payment.package?.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-6 text-sm">
                        <div>
                          <span className="text-gray-500 font-medium">
                            Jumlah:
                          </span>
                          <p className="font-bold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">
                            Tanggal:
                          </span>
                          <p className="font-medium text-gray-700">
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
  );
}

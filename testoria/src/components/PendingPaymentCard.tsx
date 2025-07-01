"use client";

import { useState } from "react";
import { Clock, CreditCard, AlertCircle } from "lucide-react";

interface PendingPaymentCardProps {
  paymentId: string;
  amount: number;
  packageTitle: string;
  createdAt: string;
  onContinuePayment: () => void;
  loading?: boolean;
}

export default function PendingPaymentCard({
  paymentId,
  amount,
  packageTitle,
  createdAt,
  onContinuePayment,
  loading = false,
}: PendingPaymentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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

  const getTimeElapsed = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} hari yang lalu`;
    } else if (diffHours > 0) {
      return `${diffHours} jam yang lalu`;
    } else if (diffMins > 0) {
      return `${diffMins} menit yang lalu`;
    } else {
      return "Baru saja";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 text-lg">
              Pembayaran Pending
            </h4>
            <p className="text-sm text-gray-600">{getTimeElapsed(createdAt)}</p>
          </div>
        </div>
        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* Package Info */}
      <div className="mb-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <p className="text-md font-medium text-blue-800 mb-1">{packageTitle}</p>
        <p className="text-xl font-bold text-blue-900">
          {formatCurrency(amount)}
        </p>
      </div>

      {/* Expandable Details */}
      <div className="mb-5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-2"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{expanded ? "Sembunyikan detail" : "Lihat detail"}</span>
        </button>

        {expanded && (
          <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">Payment ID:</span>
                <p className="font-mono text-gray-800 break-all bg-white p-2 rounded border border-gray-200 text-xs">
                  {paymentId}
                </p>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Dibuat:</span>
                <p className="text-gray-800 font-medium">
                  {formatDateTime(createdAt)}
                </p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tips:</strong> Pembayaran ini masih menunggu
                konfirmasi. Klik &quot;Lanjutkan Pembayaran&quot; untuk
                menyelesaikan transaksi.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={onContinuePayment}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl text-md font-semibold hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Memproses...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Lanjutkan Pembayaran</span>
          </div>
        )}
      </button>

      {/* Footer Warning */}
      <p className="text-xs text-gray-500 text-center mt-3">
        Pembayaran akan otomatis dibatalkan setelah 24 jam
      </p>
    </div>
  );
}

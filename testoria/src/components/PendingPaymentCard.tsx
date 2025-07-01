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
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">
              Pembayaran Pending
            </h4>
            <p className="text-xs text-gray-600">{getTimeElapsed(createdAt)}</p>
          </div>
        </div>
        <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* Package Info */}
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-800 mb-1">{packageTitle}</p>
        <p className="text-lg font-bold text-gray-900">
          {formatCurrency(amount)}
        </p>
      </div>

      {/* Expandable Details */}
      <div className="mb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-600 hover:text-gray-800 flex items-center space-x-1"
        >
          <AlertCircle className="w-3 h-3" />
          <span>{expanded ? "Sembunyikan detail" : "Lihat detail"}</span>
        </button>

        {expanded && (
          <div className="mt-2 p-2 bg-white rounded-lg border border-yellow-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Payment ID:</span>
                <p className="font-mono text-gray-800 break-all">{paymentId}</p>
              </div>
              <div>
                <span className="text-gray-500">Dibuat:</span>
                <p className="text-gray-800">{formatDateTime(createdAt)}</p>
              </div>
            </div>
            <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-xs text-yellow-800">
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
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Memproses...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Lanjutkan Pembayaran</span>
          </div>
        )}
      </button>

      {/* Footer Warning */}
      <p className="text-xs text-gray-500 text-center mt-2">
        Pembayaran akan otomatis dibatalkan setelah 24 jam
      </p>
    </div>
  );
}

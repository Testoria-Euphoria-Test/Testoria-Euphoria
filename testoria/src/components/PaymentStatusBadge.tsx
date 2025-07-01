"use client";

import { useState, useEffect } from "react";

interface PaymentStatusProps {
  paymentId: string;
  initialStatus: "paid" | "pending" | "failed";
  onStatusChange?: (newStatus: string) => void;
}

export default function PaymentStatusBadge({
  paymentId,
  initialStatus,
  onStatusChange,
}: PaymentStatusProps) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Auto-refresh hanya untuk status pending
    if (status === "pending") {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/payments/${paymentId}`, {
            credentials: "include",
          });

          if (response.ok) {
            const payment = await response.json();
            if (payment.status !== status) {
              setStatus(payment.status);
              onStatusChange?.(payment.status);
            }
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
        }
      }, 5000); // Check setiap 5 detik
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [status, paymentId, onStatusChange]);

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

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${getStatusBadge(
        status
      )}`}
    >
      {status === "pending" && (
        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      )}
      {getStatusText(status)}
    </span>
  );
}

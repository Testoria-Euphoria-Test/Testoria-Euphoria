"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface PaymentStatus {
  hasPurchased: boolean;
  paymentStatus?: string;
  paymentDate?: string;
}

export default function ButtonPayment({
  packageId,
  packagePrice,
}: {
  packageId: string;
  packagePrice: number;
}) {
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    hasPurchased: false,
  });
  const router = useRouter();

  // ✅ Check payment status when component mounts
  useEffect(() => {
    checkPaymentStatus();
  }, [packageId, packagePrice]);

  const checkPaymentStatus = async () => {
    try {
      setCheckingStatus(true);

      // Check if user has already paid for this package
      const response = await fetch("/api/payments", {
        credentials: "include",
      });

      if (response.ok) {
        const payments = await response.json();

        // Find if user has paid for this specific package
        const paidPayment = payments.find(
          (payment: any) =>
            payment.packageId === packageId && payment.status === "paid"
        );

        if (paidPayment) {
          setPaymentStatus({
            hasPurchased: true,
            paymentStatus: paidPayment.status,
            paymentDate: paidPayment.paymentDate,
          });
        } else {
          setPaymentStatus({ hasPurchased: false });
        }
      } else {
        setPaymentStatus({ hasPurchased: false });
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setPaymentStatus({ hasPurchased: false });
    } finally {
      setCheckingStatus(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);

    try {
      // 1. Create payment record
      const resCreate = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ packageId }),
      });

      if (!resCreate.ok) {
        throw new Error("Failed to create payment");
      }

      const paymentData = await resCreate.json();
      const { paymentId, amount } = paymentData;

      console.log("Payment created:", { paymentId, amount });

      // 2. Get Snap Token
      const resToken = await fetch("/api/payments/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: paymentId,
          grossAmount: amount,
        }),
      });

      if (!resToken.ok) {
        throw new Error("Failed to get payment token");
      }

      const { token } = await resToken.json();
      console.log("Token received:", token);

      // 3. Check if Midtrans Snap is loaded
      if (typeof window === "undefined") {
        throw new Error("Window object not available");
      }

      if (!window.snap) {
        await loadMidtransScript();
      }

      if (!window.snap) {
        throw new Error("Midtrans Snap not loaded. Please refresh the page.");
      }

      // 4. Call Midtrans Snap
      window.snap.pay(token, {
        onSuccess: async (result) => {
          console.log("Payment Success:", result);

          // Update payment status
          await fetch("/api/payments/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: paymentId,
              transaction_status: "settlement",
              gross_amount: amount.toString(),
              settlement_time: new Date().toISOString(),
              payment_type: result.payment_type || "unknown",
              transaction_id: result.transaction_id || paymentId,
            }),
          });


          setPaymentStatus({
            hasPurchased: true,
            paymentStatus: "paid",
            paymentDate: new Date().toISOString(),
          });

          toast.success("Pembayaran berhasil!", {
            duration: 3000,
          });

          // Delay redirect to let user see the state change
          setTimeout(() => {
            router.push("/dashboard-customer?tab=my-packages");
          }, 1500);
        },
        onPending: (result) => {
          toast.success(
            "Pembayaran sedang diproses. Silakan tunggu konfirmasi."
          );
        },
        onError: (result) => {
          toast.error("Pembayaran gagal. Silakan coba lagi.", {
            duration: 3000,
          });
        },
        onClose: () => {
          console.log("Payment popup closed");
          toast.error("Pembayaran dibatalkan.", {
            duration: 3000,
          });
        },
      });
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(
        "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMidtransScript = () => {
    return new Promise((resolve, reject) => {
      if (window.snap) {
        resolve(window.snap);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute(
        "data-client-key",
        process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""
      );

      script.onload = () => {
        if (window.snap) {
          resolve(window.snap);
        } else {
          reject(new Error("Midtrans script loaded but snap not available"));
        }
      };

      script.onerror = () => {
        reject(new Error("Failed to load Midtrans script"));
      };

      document.head.appendChild(script);
    });
  };


  if (checkingStatus) {
    return (
      <button
        disabled
        className="bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed flex-1"
      >
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
          Checking...
        </div>
      </button>
    );
  }


if (paymentStatus.hasPurchased) {
  return (
    <div className="flex-1">
      <div>
        <button
          onClick={() => router.push(`/packages/${packageId}/tryout`)}
          className="w-full bg-green-500 text-white px-3 py-3 rounded text-sm hover:bg-green-600 transition duration-200"
        >
          Akses Package
        </button>
      </div>
    </div>
  );
}

  // ✅ Show "Pay Now" if not purchased
  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 flex-1"
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Processing...
        </div>
      ) : (
        "Pay Now"
      )}
    </button>
  );
}

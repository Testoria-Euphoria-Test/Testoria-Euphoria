"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// Declare window.snap for TypeScript
declare global {
  interface Window {
    snap: any;
  }
}

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    hasPurchased: false,
  });
  const router = useRouter();

  // Check authentication and payment status when component mounts
  useEffect(() => {
    checkAuthAndPaymentStatus();
  }, [packageId, packagePrice]);

  const checkAuthAndPaymentStatus = async () => {
    try {
      setCheckingStatus(true);

      // Check authentication first
      const authResponse = await fetch("/api/auth/check", {
        credentials: "include",
      });

      if (authResponse.ok) {
        setIsAuthenticated(true);

        // If authenticated, check payment status
        await checkPaymentStatus();
      } else {
        setIsAuthenticated(false);
        setPaymentStatus({ hasPurchased: false });
      }
    } catch (error) {
      console.error("Error checking auth and payment status:", error);
      setIsAuthenticated(false);
      setPaymentStatus({ hasPurchased: false });
    } finally {
      setCheckingStatus(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      // For free packages, check if user has access (maybe through user-answers or results)
      if (packagePrice === 0) {
        const userAnswersResponse = await fetch(
          `/api/user-answers?packageId=${packageId}`,
          {
            credentials: "include",
          }
        );

        if (userAnswersResponse.ok) {
          const userAnswersData = await userAnswersResponse.json();
          const hasAccess =
            userAnswersData.userAnswers &&
            userAnswersData.userAnswers.length > 0;

          setPaymentStatus({
            hasPurchased: hasAccess,
            paymentStatus: hasAccess ? "free_access" : undefined,
            paymentDate: hasAccess ? new Date().toISOString() : undefined,
          });
        } else {
          setPaymentStatus({ hasPurchased: false });
        }
        return;
      }

      // For paid packages, check payment records
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
    }
  };

  const handleFreePackage = async () => {
    if (!isAuthenticated) {
      toast.error(
        "Silakan login terlebih dahulu untuk mengakses package gratis"
      );
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      // Grant access to free package by creating a record or just redirect to tryout
      // You might want to create a record in the database to track free package access
      const response = await fetch("/api/packages/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          packageId,
          accessType: "free",
        }),
      });

      if (response.ok) {
        setPaymentStatus({
          hasPurchased: true,
          paymentStatus: "free_access",
          paymentDate: new Date().toISOString(),
        });

        toast.success("Package gratis berhasil diakses!");

        // Delay redirect to let user see the state change
        setTimeout(() => {
          router.push(`/packages/${packageId}/tryout`);
        }, 1000);
      } else if (response.status === 401) {
        toast.error("Silakan login terlebih dahulu");
        router.push("/login");
      } else {
        throw new Error("Failed to access free package");
      }
    } catch (error) {
      console.error("Error accessing free package:", error);
      toast.error("Terjadi kesalahan saat mengakses package gratis");
    } finally {
      setLoading(false);
    }
  };

  const handlePaidPackage = async () => {
    if (!isAuthenticated) {
      toast.error("Silakan login terlebih dahulu untuk melakukan pembayaran");
      router.push("/login");
      return;
    }

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
        if (resCreate.status === 401) {
          toast.error(
            "Silakan login terlebih dahulu untuk melakukan pembayaran"
          );
          router.push("/login");
          return;
        }
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
        onSuccess: async (result: any) => {
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
        onPending: (result: any) => {
          toast.success(
            "Pembayaran sedang diproses. Silakan tunggu konfirmasi."
          );
        },
        onError: (result: any) => {
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

      // Check if it's an authentication error
      if (err instanceof Error && err.message.includes("401")) {
        toast.error("Silakan login terlebih dahulu untuk melakukan pembayaran");
        router.push("/login");
      } else {
        toast.error(
          "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (packagePrice === 0) {
      handleFreePackage();
    } else {
      handlePaidPackage();
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

  // Loading state
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

  // Not authenticated - show login button
  if (!isAuthenticated) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-200 flex-1"
      >
        Login untuk {packagePrice === 0 ? "Akses" : "Beli"}
      </button>
    );
  }

  // Already purchased - show access button
  if (paymentStatus.hasPurchased) {
    return (
      <div className="flex-1">
        <button
          onClick={() => router.push(`/packages/${packageId}/tryout`)}
          className="w-full bg-green-500 text-white px-3 py-3 rounded text-sm hover:bg-green-600 transition duration-200"
        >
          {paymentStatus.paymentStatus === "free_access"
            ? "Akses Package"
            : "Akses Package"}
        </button>
      </div>
    );
  }

  // Show appropriate button based on package price
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-4 py-2 rounded transition duration-200 flex-1 ${
        packagePrice === 0
          ? "bg-green-500 text-white hover:bg-green-600"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Processing...
        </div>
      ) : packagePrice === 0 ? (
        "Ambil Gratis"
      ) : (
        "Bayar Sekarang"
      )}
    </button>
  );
}

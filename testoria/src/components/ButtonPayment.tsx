"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

// Declare window.snap for TypeScript
declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        callbacks: {
          onSuccess: (result: MidtransResult) => void;
          onPending: () => void;
          onError: () => void;
          onClose: () => void;
        }
      ) => void;
    };
  }
}

interface PaymentStatus {
  hasPurchased: boolean;
  paymentStatus?: string;
  paymentDate?: string;
  isPending?: boolean;
  pendingPaymentId?: string; // Add this to store pending payment ID
}

interface MidtransResult {
  payment_type?: string;
  transaction_id?: string;
  transaction_status?: string;
  order_id?: string;
}

interface PaymentRecord {
  _id: string;
  packageId: string;
  status: string;
  amount: number;
  midtransOrderId: string;
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

  const checkPaymentStatus = useCallback(async () => {
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
            isPending: false,
          });
        } else {
          setPaymentStatus({ hasPurchased: false, isPending: false });
        }
        return;
      }

      // For paid packages, check payment records
      const response = await fetch("/api/payments", {
        credentials: "include",
      });

      if (response.ok) {
        const payments = await response.json();

        // Find if user has any payment record for this specific package
        const packagePayment = payments.find(
          (payment: PaymentRecord) => payment.packageId === packageId
        );

        if (packagePayment) {
          if (packagePayment.status === "paid") {
            setPaymentStatus({
              hasPurchased: true,
              paymentStatus: packagePayment.status,
              paymentDate: packagePayment.paymentDate,
              isPending: false,
            });
          } else if (packagePayment.status === "pending") {
            setPaymentStatus({
              hasPurchased: false,
              paymentStatus: packagePayment.status,
              paymentDate: packagePayment.paymentDate,
              isPending: true,
              pendingPaymentId:
                packagePayment.midtransOrderId || packagePayment._id, // Store payment ID for continuing payment
            });
          } else {
            // failed or other status
            setPaymentStatus({
              hasPurchased: false,
              isPending: false,
            });
          }
        } else {
          setPaymentStatus({
            hasPurchased: false,
            isPending: false,
          });
        }
      } else {
        setPaymentStatus({
          hasPurchased: false,
          isPending: false,
        });
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setPaymentStatus({ hasPurchased: false, isPending: false });
    }
  }, [packageId, packagePrice]);

  const checkAuthAndPaymentStatus = useCallback(async () => {
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
        setPaymentStatus({ hasPurchased: false, isPending: false });
      }
    } catch (error) {
      console.error("Error checking auth and payment status:", error);
      setIsAuthenticated(false);
      setPaymentStatus({ hasPurchased: false, isPending: false });
    } finally {
      setCheckingStatus(false);
    }
  }, [checkPaymentStatus]);

  // Check authentication and payment status when component mounts
  useEffect(() => {
    checkAuthAndPaymentStatus();
  }, [checkAuthAndPaymentStatus]);

  // Auto-refresh payment status if pending
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (paymentStatus.isPending) {
      interval = setInterval(() => {
        checkPaymentStatus();
      }, 10000); // Check every 10 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [paymentStatus.isPending, checkPaymentStatus]);

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
        onSuccess: async (result: MidtransResult) => {
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
            isPending: false,
          });

          toast.success("Pembayaran berhasil!", {
            duration: 3000,
          });

          // Delay redirect to let user see the state change
          setTimeout(() => {
            router.push("/dashboard-customer?tab=my-packages");
          }, 1500);
        },
        onPending: () => {
          setPaymentStatus({
            hasPurchased: false,
            paymentStatus: "pending",
            isPending: true,
          });

          toast.success(
            "Pembayaran sedang diproses. Silakan tunggu konfirmasi."
          );
        },
        onError: () => {
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

  const handleContinuePendingPayment = async () => {
    if (!isAuthenticated) {
      toast.error("Silakan login terlebih dahulu untuk melakukan pembayaran");
      router.push("/login");
      return;
    }

    if (!paymentStatus.pendingPaymentId) {
      toast.error("Tidak dapat menemukan informasi pembayaran pending");
      return;
    }

    setLoading(true);

    try {
      // Get the pending payment details
      const pendingResponse = await fetch("/api/payments", {
        credentials: "include",
      });

      if (!pendingResponse.ok) {
        throw new Error("Failed to get payment details");
      }

      const payments = await pendingResponse.json();
      const pendingPayment = payments.find(
        (payment: PaymentRecord) =>
          payment.packageId === packageId && payment.status === "pending"
      );

      if (!pendingPayment) {
        toast.error("Pembayaran pending tidak ditemukan");
        // Refresh status to update UI
        await checkPaymentStatus();
        return;
      }

      // Get new Snap Token for the existing payment
      const resToken = await fetch("/api/payments/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: pendingPayment.midtransOrderId,
          grossAmount: pendingPayment.amount,
        }),
      });

      if (!resToken.ok) {
        throw new Error("Failed to get payment token");
      }

      const { token } = await resToken.json();
      console.log("Token received for pending payment:", token);

      // Check if Midtrans Snap is loaded
      if (typeof window === "undefined") {
        throw new Error("Window object not available");
      }

      if (!window.snap) {
        await loadMidtransScript();
      }

      if (!window.snap) {
        throw new Error("Midtrans Snap not loaded. Please refresh the page.");
      }

      // Call Midtrans Snap with the same handlers
      window.snap.pay(token, {
        onSuccess: async (result: MidtransResult) => {
          console.log("Payment Success:", result);

          // Update payment status via webhook simulation
          await fetch("/api/payments/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: pendingPayment.midtransOrderId,
              transaction_status: "settlement",
              gross_amount: pendingPayment.amount.toString(),
              settlement_time: new Date().toISOString(),
              payment_type: result.payment_type || "unknown",
              transaction_id:
                result.transaction_id || pendingPayment.midtransOrderId,
            }),
          });

          setPaymentStatus({
            hasPurchased: true,
            paymentStatus: "paid",
            paymentDate: new Date().toISOString(),
            isPending: false,
          });

          toast.success("Pembayaran berhasil!", {
            duration: 3000,
          });

          setTimeout(() => {
            router.push("/dashboard-customer?tab=my-packages");
          }, 1500);
        },
        onPending: () => {
          toast.success(
            "Pembayaran sedang diproses. Silakan tunggu konfirmasi."
          );
        },
        onError: () => {
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
      console.error("Continue payment error:", err);
      toast.error(
        "Terjadi kesalahan saat melanjutkan pembayaran. Silakan coba lagi."
      );
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
        className="w-full bg-blue-500 text-white px-4 py-2  hover:bg-blue-400 transition duration-200 flex-1 rounded-2xl font-bold "
      >
        {packagePrice === 0 ? "Akses" : "Beli"}
      </button>
    );
  }

  // Already purchased - show access button
  if (paymentStatus.hasPurchased) {
    return (
      <div className="flex-1 ">
        <button
          onClick={() => router.push(`/packages/${packageId}/tryout`)}
          className="w-full bg-green-500 text-white px-3 py-3 text-sm hover:bg-green-600 transition duration-200 font-bold rounded-2xl "
        >
          {paymentStatus.paymentStatus === "free_access"
            ? "Akses Paket"
            : "Akses Paket"}
        </button>
      </div>
    );
  }

  // Payment is pending - show enhanced status with option to continue payment
  if (paymentStatus.isPending) {
    return (
      <div className="flex h-full ">
        <button
          onClick={handleContinuePendingPayment}
          disabled={loading}
          className="w-full bg-amber-400 text-white px-3 py-3 text-sm hover:bg-amber-600 transition duration-200 font-bold rounded-2xl"
        >
          {loading ? (
            <div className="flex items-center justify-center ">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Memproses...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center text-white h-2">
              <span>Lanjutkan Pembayaran</span>
            </div>
          )}
        </button>
      </div>
    );
  }

  // Show appropriate button based on package price
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full py-3 px-4 rounded-2xl transition-all duration-300 font-bold text-sm transform hover:scale-105 shadow-lg hover:shadow-xl ${
        packagePrice === 0
          ? " bg-green-500 text-white hover:from-green-600 hover:to-emerald-700"
          : " bg-blue-600  text-white hover:from-blue-700 hover:to-purple-700"
          // w-full bg-blue-900 text-white font-semibold py-3 rounded-2xl hover:bg-blue-800 transition-all duration-300
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          <span>Processing...</span>
        </div>
      ) : packagePrice === 0 ? (
        "Akses Paket "
      ) : (
        "Beli Sekarang"
      )}
    </button>
  );
}

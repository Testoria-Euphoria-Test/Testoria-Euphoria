"use client";

import { useState } from "react";

export default function ButtonPayment({ packageId }: { packageId: string }) {
  const [loading, setLoading] = useState(false);

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
        // Load Midtrans script if not available
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
            }),
          });

          alert(
            "🎉 Pembayaran berhasil! Package telah ditambahkan ke My Packages."
          );
          window.location.href = "/dashboard-customer?tab=my-packages";
        },
        onPending: (result) => {
          console.log("Payment Pending:", result);
          alert("Pembayaran sedang diproses. Silakan tunggu konfirmasi.");
        },
        onError: (result) => {
          console.error("Payment Error:", result);
          alert("❌ Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: () => {
          console.log("Payment popup closed");
        },
      });
    } catch (err) {
      console.error("Payment error:", err);
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to load Midtrans script dynamically
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

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 flex-1"
    >
      {loading ? "Processing..." : "Pay Now"}
    </button>
  );
}

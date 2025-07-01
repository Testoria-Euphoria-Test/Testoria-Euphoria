import { NextRequest, NextResponse } from "next/server";
import PaymentModel from "@/db/models/PaymentModel";
import { verifyMidtransSignature } from "@/helpers/midtrans";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;

// This is the webhook endpoint that Midtrans will call
// URL should be: https://r1fnwz2s-3000.asse.devtunnels.ms/api/payments/webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📨 Midtrans Webhook received:", body);

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      settlement_time,
      payment_type,
      transaction_id,
      fraud_status,
    } = body;

    // Validate required fields
    if (!order_id || !transaction_status) {
      console.error("❌ Missing required fields:", {
        order_id,
        transaction_status,
      });
      return NextResponse.json(
        {
          error: "Missing required fields: order_id and transaction_status",
        },
        { status: 400 }
      );
    }

    // Verify signature according to Midtrans documentation
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment && signature_key) {
      const isValid = verifyMidtransSignature({
        order_id,
        status_code,
        gross_amount,
        signature_key,
        serverKey: MIDTRANS_SERVER_KEY,
      });

      if (!isValid) {
        console.error("❌ Invalid Midtrans signature for order:", order_id);
        return NextResponse.json(
          {
            message: "Invalid signature",
          },
          { status: 403 }
        );
      }
      console.log("✅ Signature verified for order:", order_id);
    } else {
      console.log("🔧 Development mode: Skipping signature verification");
    }

    // Check if payment exists
    const existingPayment = await PaymentModel.findByMidtransOrderId(order_id);
    if (!existingPayment) {
      console.error("❌ Payment not found for order:", order_id);
      return NextResponse.json(
        {
          error: "Payment not found",
        },
        { status: 404 }
      );
    }

    // Map Midtrans transaction status to our payment status according to documentation
    let newStatus: "paid" | "failed" | "pending";

    if (transaction_status === "capture") {
      // For credit card payment, check fraud_status
      if (fraud_status === "accept") {
        newStatus = "paid";
      } else {
        newStatus = "pending"; // Wait for manual review
      }
    } else if (transaction_status === "settlement") {
      newStatus = "paid";
    } else if (
      ["cancel", "deny", "expire", "failure"].includes(transaction_status)
    ) {
      newStatus = "failed";
    } else if (transaction_status === "pending") {
      newStatus = "pending";
    } else {
      console.warn("⚠️ Unknown transaction status:", transaction_status);
      newStatus = "pending";
    }

    // Prevent unnecessary updates
    if (existingPayment.status === newStatus) {
      console.log(
        `⚠️ Payment status already ${newStatus} for order:`,
        order_id
      );
      return NextResponse.json({
        message: "Payment status already up to date",
        orderId: order_id,
        status: newStatus,
      });
    }

    // Set payment date for successful payments
    const paymentDate =
      newStatus === "paid"
        ? settlement_time || new Date().toISOString()
        : undefined;

    const updateResult = await PaymentModel.updateStatus(
      order_id,
      newStatus,
      paymentDate
    );

    if (!updateResult) {
      console.error("❌ Failed to update payment status for order:", order_id);
      return NextResponse.json(
        {
          message: "Failed to update payment status",
        },
        { status: 500 }
      );
    }

    console.log(
      `✅ Payment status updated for order ${order_id}: ${existingPayment.status} -> ${newStatus}`
    );

    // Log additional information for debugging
    console.log("Payment update details:", {
      orderId: order_id,
      previousStatus: existingPayment.status,
      newStatus,
      transactionStatus: transaction_status,
      paymentType: payment_type,
      transactionId: transaction_id,
      fraudStatus: fraud_status,
      paymentDate,
    });

    return NextResponse.json({
      message: "Payment status updated successfully",
      orderId: order_id,
      status: newStatus,
      transactionStatus: transaction_status,
      paymentDate: paymentDate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("💥 Payment webhook error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const isDevelopment = process.env.NODE_ENV === "development";
    return NextResponse.json(
      {
        error: "Internal server error",
        details: isDevelopment ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

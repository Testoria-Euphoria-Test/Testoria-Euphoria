import { NextRequest, NextResponse } from "next/server";
import PaymentModel from "@/db/models/PaymentModel";
import { verifyMidtransSignature } from "@/helpers/midtrans";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📨 Notification received:", body); // ✅ Better logging

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      settlement_time,
      payment_type, // ✅ Add payment_type
      transaction_id, // ✅ Add transaction_id
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

    // Skip signature verification in development mode for testing
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment) {
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

    // ✅ Check if payment exists first
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

    // ✅ Prevent duplicate processing for paid payments
    if (
      existingPayment.status === "paid" &&
      transaction_status === "settlement"
    ) {
      console.log("⚠️ Payment already processed for order:", order_id);
      return NextResponse.json({
        message: "Payment already processed",
        status: "paid",
      });
    }

    // Map Midtrans transaction status to our payment status
    let newStatus: "paid" | "failed" | "pending";
    switch (transaction_status) {
      case "capture":
      case "settlement":
        newStatus = "paid";
        break;
      case "cancel":
      case "deny":
      case "expire":
      case "failure":
        newStatus = "failed";
        break;
      case "pending":
        newStatus = "pending";
        break;
      default:
        console.warn("⚠️ Unknown transaction status:", transaction_status);
        newStatus = "pending";
        break;
    }

    // ✅ Use settlement_time for paid status, current time for others
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
      `✅ Payment status updated for order ${order_id}: ${newStatus}`
    );

    // ✅ Return more detailed response
    return NextResponse.json({
      message: "Payment status updated successfully",
      orderId: order_id,
      status: newStatus,
      transactionStatus: transaction_status,
      paymentDate: paymentDate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("💥 Payment notification error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: "Internal server error",
        details: isDevelopment ? errorMessage : undefined, // ✅ Show details only in dev
      },
      { status: 500 }
    );
  }
}


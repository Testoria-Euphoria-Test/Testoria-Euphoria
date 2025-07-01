// app/api/payments/token/route.ts
import { NextRequest, NextResponse } from "next/server";

// Import midtrans-client with proper typing
import * as midtransClient from "midtrans-client";

export async function POST(request: NextRequest) {
  try {
    const { orderId, grossAmount } = await request.json();

    if (!orderId || !grossAmount) {
      return NextResponse.json(
        { error: "orderId and grossAmount are required" },
        { status: 400 }
      );
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      credit_card: {
        secure: true,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error("Snap token error:", error);
    return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
  }
}

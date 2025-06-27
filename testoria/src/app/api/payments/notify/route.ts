import { NextRequest, NextResponse } from "next/server";
import PaymentModel from "@/db/models/PaymentModel";
import { verifyMidtransSignature } from "@/helpers/midtrans";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            order_id,
            status_code,
            gross_amount,
            signature_key,
            transaction_status,
            settlement_time,
        } = body;

        // Validate required fields
        if (!order_id || !transaction_status) {
            return NextResponse.json({ error: "Missing required fields: order_id and transaction_status" }, { status: 400 });
        }

        // Skip signature verification in development mode for testing
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (!isDevelopment) {
            const isValid = verifyMidtransSignature({
                order_id,
                status_code,
                gross_amount,
                signature_key,
                serverKey: MIDTRANS_SERVER_KEY,
            });

            if (!isValid) {
                console.log("Invalid Midtrans signature");
                return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
            }
        } else {
            console.log("Development mode: Skipping signature verification");
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
            default:
                newStatus = "pending";
                break;
        }

        const updateResult = await PaymentModel.updateStatus(order_id, newStatus, settlement_time || new Date().toISOString());
        
        if (!updateResult) {
            console.error("Failed to update payment status for order:", order_id);
            return NextResponse.json({ message: "Failed to update payment status" }, { status: 500 });
        }

        console.log(`Payment status updated for order ${order_id}: ${newStatus}`);
        return NextResponse.json({ message: "Payment status updated", status: newStatus });
    } catch (error) {
        console.error("Payment notification error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

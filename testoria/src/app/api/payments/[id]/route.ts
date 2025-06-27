import { NextRequest, NextResponse } from "next/server";
import PaymentModel from "@/db/models/PaymentModel";

export async function GET(
    req: NextRequest, 
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    return new Promise(async (resolve) => {
        try {
            const id = params.id;
            
            // Validate ID format
            if (!id || id.trim() === '') {
                resolve(NextResponse.json({ error: "Invalid payment ID" }, { status: 400 }));
                return;
            }

            const data = await PaymentModel.getById(id);
            
            if (!data) {
                resolve(NextResponse.json({ error: "Payment not found" }, { status: 404 }));
                return;
            }
            
            resolve(NextResponse.json(data));
        } catch (error) {
            console.error("Payment retrieval error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            resolve(NextResponse.json({ error: errorMessage }, { status: 500 }));
        }
    });
}
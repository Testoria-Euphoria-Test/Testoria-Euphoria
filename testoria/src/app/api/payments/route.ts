import { NextRequest, NextResponse } from "next/server";
import PaymentModel from "@/db/models/PaymentModel";
import { database } from "@/db/config/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
    try {
        // Get userId from middleware header
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const { packageId } = await req.json();
        
        // Validate required fields
        if (!packageId) {
            return NextResponse.json({ error: "Missing required field: packageId" }, { status: 400 });
        }

        const pkg = await database.collection("packages").findOne({ _id: new ObjectId(packageId) });
        if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

        if (!pkg.price || pkg.price <= 0) {
            return NextResponse.json({ error: "Invalid package price" }, { status: 400 });
        }

        const amount = pkg.price;
        const paymentId = await PaymentModel.create({ 
            userId, 
            packageId, 
            amount, 
            status: "pending" 
        });
        
        return NextResponse.json({ 
            paymentId: paymentId.toString(),
            amount,
            status: "pending"
        });
    } catch (error) {
        console.error("Payment creation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        // Get userId from middleware header (for authenticated user's payment history)
        const userIdFromHeader = req.headers.get('x-user-id');
        
        // Allow query parameter for admin access or specific user lookup
        const userIdFromQuery = req.nextUrl.searchParams.get("userId");
        
        // Use header userId by default, fall back to query parameter
        const userId = userIdFromHeader || userIdFromQuery;
        
        if (!userId) {
            return NextResponse.json({ error: "Authentication required or missing userId" }, { status: 401 });
        }
        
        const history = await PaymentModel.getByUserId(userId);
        return NextResponse.json(history);
    } catch (error) {
        console.error("Payment history retrieval error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
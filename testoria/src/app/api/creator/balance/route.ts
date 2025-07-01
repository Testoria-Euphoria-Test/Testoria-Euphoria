import { NextResponse } from "next/server";
import UserModel from "@/db/models/UserModel";
import errorHandler from "@/helpers/errorHandler";

export async function GET(req: Request) {
  try {
    // Get user info from middleware headers (requires auth)
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');

    if (!userId) {
      throw { message: "Unauthorized - Authentication required", status: 401 };
    }

    if (userRole !== 'creator') {
      throw { message: "Forbidden - Only creators can check balance", status: 403 };
    }

    // Get user's balance
    const balance = await UserModel.getBalance(userId);

    return NextResponse.json({
      success: true,
      message: "Balance retrieved successfully",
      data: {
        balance: balance,
        userId: userId
      }
    });

  } catch (error) {
    console.error("Error fetching balance:", error);
    return errorHandler(error);
  }
}

// Initialize balance for existing creators (migration endpoint)
export async function POST(req: Request) {
  try {
    // Get user info from middleware headers (requires auth)
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');

    if (!userId) {
      throw { message: "Unauthorized - Authentication required", status: 401 };
    }

    if (userRole !== 'creator') {
      throw { message: "Forbidden - Only creators can initialize balance", status: 403 };
    }

    // Initialize balance if it doesn't exist
    const initialized = await UserModel.initializeCreatorBalance(userId);

    return NextResponse.json({
      success: true,
      message: initialized ? "Balance initialized successfully" : "Balance already exists",
      data: {
        initialized: initialized,
        userId: userId
      }
    });

  } catch (error) {
    console.error("Error initializing balance:", error);
    return errorHandler(error);
  }
}

import { NextResponse } from "next/server";
import PaymentModel from "@/db/models/PaymentModel";
import errorHandler from "@/helpers/errorHandler";

export async function GET(req: Request) {
  try {
    // Get user info from middleware headers (requires auth)
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');

    if (!userId) {
      throw { message: "Unauthorized - Authentication required", status: 401 };
    }

    if (userRole !== 'admin') {
      throw { message: "Forbidden - Only admins can view revenue", status: 403 };
    }

    // Get query parameters for date filtering
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filters: any = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    // Get admin revenue statistics
    const revenueData = await PaymentModel.getAdminRevenue(filters);

    return NextResponse.json({
      success: true,
      message: "Admin revenue retrieved successfully",
      data: revenueData
    });

  } catch (error) {
    console.error("Error fetching admin revenue:", error);
    return errorHandler(error);
  }
}

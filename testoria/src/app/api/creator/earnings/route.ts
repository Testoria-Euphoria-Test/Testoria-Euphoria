import { NextResponse } from "next/server";
import PaymentModel from "@/db/models/PaymentModel";
import PackageModel from "@/db/models/PackageModel";
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
      throw { message: "Forbidden - Only creators can view earnings", status: 403 };
    }

    // Get creator's packages
    const creatorPackages = await PackageModel.findByCreatorId(userId);
    const packageIds = creatorPackages.map(pkg => pkg._id.toString());

    if (packageIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No packages found",
        data: {
          totalEarnings: 0,
          totalSales: 0,
          packageSales: []
        }
      });
    }

    // Get payments for creator's packages
    const earnings = await PaymentModel.collection().aggregate([
      {
        $match: {
          packageId: { $in: packageIds.map(id => new (require('mongodb').ObjectId)(id)) },
          status: "paid"
        }
      },
      {
        $lookup: {
          from: "packages",
          localField: "packageId",
          foreignField: "_id",
          as: "package"
        }
      },
      {
        $unwind: "$package"
      },
      {
        $group: {
          _id: "$packageId",
          packageTitle: { $first: "$package.title" },
          totalSales: { $sum: 1 },
          totalGrossRevenue: { $sum: "$amount" }, // Total amount paid by customers
          totalCreatorEarnings: { $sum: { $multiply: ["$amount", 0.7] } }, // 70% to creator
          latestSale: { $max: "$paymentDate" }
        }
      },
      {
        $sort: { totalCreatorEarnings: -1 }
      }
    ]).toArray();

    const totalCreatorEarnings = earnings.reduce((sum, item) => sum + item.totalCreatorEarnings, 0);
    const totalGrossRevenue = earnings.reduce((sum, item) => sum + item.totalGrossRevenue, 0);
    const totalSales = earnings.reduce((sum, item) => sum + item.totalSales, 0);

    return NextResponse.json({
      success: true,
      message: "Earnings retrieved successfully",
      data: {
        totalEarnings: Math.round(totalCreatorEarnings), // Creator's 70% share
        totalGrossRevenue: totalGrossRevenue, // Total amount paid by customers
        totalSales,
        revenueShare: 70, // Creator gets 70%
        packageSales: earnings.map(item => ({
          packageId: item._id,
          packageTitle: item.packageTitle,
          totalSales: item.totalSales,
          totalEarnings: Math.round(item.totalCreatorEarnings), // Creator's 70% share
          totalGrossRevenue: item.totalGrossRevenue, // Total amount paid by customers
          latestSale: item.latestSale
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching earnings:", error);
    return errorHandler(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import PackageModel from "@/db/models/PackageModel";
import errorHandler from "@/helpers/errorHandler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get user info from middleware headers (requires auth)
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      throw { message: "Unauthorized - Authentication required", status: 401 };
    }

    // Get rating from request body
    const { rating } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Find the package
    const packageDoc = await PackageModel.findById(id);

    if (!packageDoc) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Initialize ratings array if it doesn't exist
    if (!packageDoc.ratings) {
      packageDoc.ratings = [];
    }

    // Check if user has already rated this package
    const existingRatingIndex = packageDoc.ratings.findIndex(
      (r: { userId: string; rating: number }) => r.userId.toString() === userId
    );

    if (existingRatingIndex >= 0) {
      // Update existing rating
      packageDoc.ratings[existingRatingIndex].rating = rating;
      packageDoc.ratings[existingRatingIndex].updatedAt = new Date();
    } else {
      // Add new rating
      packageDoc.ratings.push({
        userId: userId,
        rating: rating,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Calculate average rating
    const totalRatings = packageDoc.ratings.length;
    const sumRatings = packageDoc.ratings.reduce(
      (sum: number, r: { rating: number }) => sum + r.rating,
      0
    );
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    await PackageModel.updateById(id, {
      ratings: packageDoc.ratings,
      averageRating: averageRating,
    });

    return NextResponse.json({
      success: true,
      message: "Rating submitted successfully",
      averageRating: averageRating,
      totalRatings: totalRatings,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

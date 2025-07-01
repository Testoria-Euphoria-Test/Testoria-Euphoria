import { NextRequest, NextResponse } from "next/server";
import ProfileModel from "@/db/models/ProfileModel";
import errorHandler from "@/helpers/errorHandler";

export async function GET(req: NextRequest) {
  try {
    // Get user info from middleware headers (requires auth)
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      throw { message: "Unauthorized - Authentication required", status: 401 };
    }

    // Get profile data
    const profile = await ProfileModel.findByUserId(userId);

    if (!profile) {
      // Return empty profile structure if not found
      return NextResponse.json({
        success: true,
        message: "Profile not found, returning empty profile",
        data: {
          userId,
          photoUrl: "",
          education: "",
          certificates: [],
          bio: "",
          createdAt: null,
          updatedAt: null
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profile retrieved successfully",
      data: profile
    });

  } catch (error) {
    console.error("Error fetching profile:", error);
    return errorHandler(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Get user info from middleware headers (requires auth)
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      throw { message: "Unauthorized - Authentication required", status: 401 };
    }

    // Get update data from request body
    const updateData = await req.json();
    
    // Validate update data
    const allowedFields = ['education', 'bio'];
    const filteredData: any = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      throw { message: "No valid fields to update", status: 400 };
    }

    // Update or create profile
    const updatedProfile = await ProfileModel.createOrUpdate(userId, filteredData);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    return errorHandler(error);
  }
}

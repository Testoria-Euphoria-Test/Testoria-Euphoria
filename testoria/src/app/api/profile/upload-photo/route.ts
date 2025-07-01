import { NextRequest, NextResponse } from "next/server";
import ProfileModel from "@/db/models/ProfileModel";
import CloudinaryHelper from "@/helpers/cloudinary";
import errorHandler from "@/helpers/errorHandler";

export async function POST(req: NextRequest) {
  try {
    // Get user info from middleware headers (requires auth)
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');

    if (!userId) {
      throw { message: "Unauthorized - Authentication required", status: 401 };
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('photo') as File;

    if (!file) {
      throw { message: "No photo file provided", status: 400 };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw { message: "Invalid file type. Only JPEG, PNG, and WebP are allowed", status: 400 };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw { message: "File size too large. Maximum 5MB allowed", status: 400 };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get current profile to delete old photo if exists
    const currentProfile = await ProfileModel.findByUserId(userId);
    let oldPhotoPublicId = null;
    
    if (currentProfile?.photoUrl) {
      oldPhotoPublicId = CloudinaryHelper.extractPublicId(currentProfile.photoUrl);
    }

    // Upload to Cloudinary
    const uploadResult = await CloudinaryHelper.uploadProfilePhoto(buffer, userId);

    // Update or create profile with new photo URL
    const updatedProfile = await ProfileModel.createOrUpdate(userId, {
      photoUrl: uploadResult.secure_url
    });

    // Delete old photo from Cloudinary if it exists
    if (oldPhotoPublicId) {
      await CloudinaryHelper.deleteImage(oldPhotoPublicId);
    }

    return NextResponse.json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: {
        photoUrl: uploadResult.secure_url,
        profile: updatedProfile
      }
    });

  } catch (error) {
    console.error("Error uploading profile photo:", error);
    return errorHandler(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Get user info from middleware headers (requires auth)
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      throw { message: "Unauthorized - Authentication required", status: 401 };
    }

    // Get current profile
    const currentProfile = await ProfileModel.findByUserId(userId);
    
    if (!currentProfile?.photoUrl) {
      throw { message: "No profile photo to delete", status: 404 };
    }

    // Extract public ID and delete from Cloudinary
    const publicId = CloudinaryHelper.extractPublicId(currentProfile.photoUrl);
    const deleted = await CloudinaryHelper.deleteImage(publicId);

    if (!deleted) {
      console.warn("Failed to delete image from Cloudinary, but continuing with database update");
    }

    // Remove photo URL from profile
    const updated = await ProfileModel.updateByUserId(userId, {
      photoUrl: ""
    });

    if (!updated) {
      throw { message: "Failed to update profile", status: 500 };
    }

    return NextResponse.json({
      success: true,
      message: "Profile photo deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting profile photo:", error);
    return errorHandler(error);
  }
}

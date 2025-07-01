import { NextRequest, NextResponse } from "next/server";
import ProfileModel from "@/db/models/ProfileModel";
import CloudinaryHelper from "@/helpers/cloudinary";
import errorHandler from "@/helpers/errorHandler";

export async function POST(req: NextRequest) {
  try {
    // Get user info from middleware headers (requires auth)
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      throw { message: "Unauthorized - Authentication required", status: 401 };
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('certificate') as File;

    if (!file) {
      throw { message: "No certificate file provided", status: 400 };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw { message: "Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed", status: 400 };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw { message: "File size too large. Maximum 10MB allowed", status: 400 };
    }

    // Check current certificates count (max 10)
    const currentProfile = await ProfileModel.findByUserId(userId);
    const currentCertificates = currentProfile?.certificates || [];
    
    if (currentCertificates.length >= 10) {
      throw { message: "Maximum 10 certificates allowed", status: 400 };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await CloudinaryHelper.uploadCertificate(buffer, userId);

    // Add certificate URL to profile
    if (currentProfile) {
      await ProfileModel.addCertificate(userId, uploadResult.secure_url);
    } else {
      // Create new profile if doesn't exist
      await ProfileModel.createOrUpdate(userId, {
        certificates: [uploadResult.secure_url]
      });
    }

    // Get updated profile
    const updatedProfile = await ProfileModel.findByUserId(userId);

    return NextResponse.json({
      success: true,
      message: "Certificate uploaded successfully",
      data: {
        certificateUrl: uploadResult.secure_url,
        certificates: updatedProfile?.certificates || [],
        profile: updatedProfile
      }
    });

  } catch (error) {
    console.error("Error uploading certificate:", error);
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

    // Get certificate URL from request body
    const { certificateUrl } = await req.json();

    if (!certificateUrl) {
      throw { message: "Certificate URL is required", status: 400 };
    }

    // Get current profile
    const currentProfile = await ProfileModel.findByUserId(userId);
    
    if (!currentProfile?.certificates?.includes(certificateUrl)) {
      throw { message: "Certificate not found in profile", status: 404 };
    }

    // Extract public ID and delete from Cloudinary
    const publicId = CloudinaryHelper.extractPublicId(certificateUrl);
    const deleted = await CloudinaryHelper.deleteImage(publicId);

    if (!deleted) {
      console.warn("Failed to delete certificate from Cloudinary, but continuing with database update");
    }

    // Remove certificate URL from profile
    const updated = await ProfileModel.removeCertificate(userId, certificateUrl);

    if (!updated) {
      throw { message: "Failed to update profile", status: 500 };
    }

    // Get updated profile
    const updatedProfile = await ProfileModel.findByUserId(userId);

    return NextResponse.json({
      success: true,
      message: "Certificate deleted successfully",
      data: {
        certificates: updatedProfile?.certificates || []
      }
    });

  } catch (error) {
    console.error("Error deleting certificate:", error);
    return errorHandler(error);
  }
}

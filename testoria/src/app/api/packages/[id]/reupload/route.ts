import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { database } from "@/db/config/mongodb";
import { processPdfForPackage } from "@/helpers/processPdfForPackage";
import errorHandler from "@/helpers/errorHandler";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: packageId } = await params;

        // Validate ObjectId format
        if (!ObjectId.isValid(packageId)) {
            return NextResponse.json({ message: "Invalid package ID format" }, { status: 400 });
        }

        // Get user info from middleware headers (requires auth)
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized - Authentication required" }, { status: 401 });
        }

        // Get the package from database
        const pkg = await database.collection("packages").findOne({
            _id: new ObjectId(packageId),
        });

        if (!pkg) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        // Check if user has permission (owner or admin)
        const userRole = request.headers.get('x-user-role');
        const isOwner = pkg.creatorId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ message: "Forbidden - You can only access your own packages or you must be an admin" }, { status: 403 });
        }

        // Check PDF accessibility
        let pdfStatus = "unknown";
        let pdfAccessible = false;
        let errorDetails = null;

        if (pkg.sourcePdf && pkg.sourcePdf.length > 0) {
            try {
                const pdfUrl = pkg.sourcePdf[0];
                const response = await fetch(pdfUrl, { method: 'HEAD' });
                
                if (response.ok) {
                    pdfStatus = "accessible";
                    pdfAccessible = true;
                } else {
                    pdfStatus = "inaccessible";
                    errorDetails = `HTTP ${response.status}: ${response.statusText}`;
                }
            } catch (error) {
                pdfStatus = "error";
                errorDetails = error instanceof Error ? error.message : "Unknown error";
            }
        } else {
            pdfStatus = "missing";
            errorDetails = "No PDF URL found in package";
        }

        return NextResponse.json({
            success: true,
            data: {
                packageId: packageId,
                title: pkg.title,
                currentPdfUrl: pkg.sourcePdf?.[0] || null,
                pdfStatus: pdfStatus,
                pdfAccessible: pdfAccessible,
                errorDetails: errorDetails,
                imageCount: pkg.pdfImages?.length || 0,
                hasProcessedContent: pkg.contents && Array.isArray(pkg.contents) && pkg.contents.length > 0,
                lastUpdated: pkg.updatedAt,
                needsReupload: !pdfAccessible,
                recommendations: !pdfAccessible ? [
                    "The current PDF is not accessible",
                    "Use PATCH /reupload to upload a new PDF file",
                    "After reupload, run AI processing to extract questions"
                ] : [
                    "PDF is accessible and ready for processing",
                    "You can run AI processing if needed"
                ]
            }
        });

    } catch (error) {
        console.error("Error checking package status:", error);
        return errorHandler(error);
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: packageId } = await params;

        // Validate ObjectId format
        if (!ObjectId.isValid(packageId)) {
            return NextResponse.json({ message: "Invalid package ID format" }, { status: 400 });
        }

        // Get user info from middleware headers (requires auth)
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized - Authentication required" }, { status: 401 });
        }

        // Get the package from database
        const pkg = await database.collection("packages").findOne({
            _id: new ObjectId(packageId),
        });

        if (!pkg) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        // Check if user has permission (owner or admin)
        const userRole = request.headers.get('x-user-role');
        const isOwner = pkg.creatorId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ message: "Forbidden - You can only update your own packages or you must be an admin" }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "PDF file is required" }, { status: 400 });
        }

        // Validate file type (PDF only)
        if (file.type !== 'application/pdf') {
            return NextResponse.json({ message: "Only PDF files are allowed" }, { status: 400 });
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return NextResponse.json({ 
                message: "File size too large. Maximum allowed size is 50MB",
                fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
                maxAllowed: "50MB"
            }, { status: 400 });
        }

        console.log(`Re-uploading PDF for package ${packageId}... File: ${file.name}, Size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);

        // Store old PDF info for cleanup reference
        const oldPdfUrl = pkg.sourcePdf?.[0] || null;
        const oldImageCount = pkg.pdfImages?.length || 0;

        // Process new PDF (upload and generate page URLs)
        const buffer = Buffer.from(await file.arrayBuffer());
        
        let processResult;
        try {
            processResult = await processPdfForPackage(buffer, file.name);
        } catch (processError) {
            console.error("Failed to process PDF:", processError);
            return NextResponse.json({ 
                message: "Failed to process PDF file",
                error: processError instanceof Error ? processError.message : "Unknown processing error",
                troubleshooting: [
                    "Ensure the PDF file is not corrupted",
                    "Check if the PDF has proper permissions (not password protected)",
                    "Try with a smaller PDF file",
                    "Verify PDF contains readable content"
                ]
            }, { status: 500 });
        }

        const { pdfUrl: newPdfUrl, pdfImages: newPdfImages, pageCount } = processResult;

        console.log(`✅ New PDF processed: ${newPdfUrl}, ${pageCount} pages, ${newPdfImages.length} image URLs`);

        // Update package with new PDF URL and images, and clear old processed content
        const updateResult = await database.collection("packages").updateOne(
            { _id: new ObjectId(packageId) },
            { 
                $set: { 
                    sourcePdf: [newPdfUrl],
                    pdfImages: newPdfImages, // Set new page image URLs
                    updatedAt: new Date()
                },
                $unset: {
                    contents: "",  // Clear old AI processed content since we have new PDF
                    aiProcessing: ""  // Clear old AI processing info
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ message: "Package not found for update" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "PDF re-uploaded and processed successfully",
            data: {
                packageId: packageId,
                fileName: file.name,
                fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
                newPdfUrl: newPdfUrl,
                oldPdfUrl: oldPdfUrl,
                pageCount: pageCount,
                pdfImagesGenerated: newPdfImages.length,
                oldImageCount: oldImageCount,
                changes: {
                    pdfReplaced: true,
                    oldContentCleared: true,
                    newImagesGenerated: newPdfImages.length,
                    ready_for_ai_processing: true
                },
                nextSteps: [
                    "The PDF has been re-uploaded with proper access permissions",
                    `${newPdfImages.length} page image URLs have been generated using Cloudinary transformations`,
                    "Old AI processed content has been cleared",
                    "You can now call PATCH /api/packages/{id}/process to extract questions from the new images",
                    "Visit the package detail page to manage questions after AI processing"
                ]
            }
        });

    } catch (error) {
        console.error("Error re-uploading PDF:", error);
        return errorHandler(error);
    }
}

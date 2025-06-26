import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { database } from "@/db/config/mongodb";
import { uploadToCloudinary } from "@/helpers/uploadToCloudinary";
import errorHandler from "@/helpers/errorHandler";

export const config = {
  api: {
    bodyParser: false,
  },
};

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

        // Check if user has permission (owner only)
        if (pkg.creatorId.toString() !== userId) {
            return NextResponse.json({ message: "Forbidden - You can only update your own packages" }, { status: 403 });
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

        console.log(`Re-uploading PDF for package ${packageId}...`);

        // Upload new PDF to Cloudinary
        const buffer = Buffer.from(await file.arrayBuffer());
        const newPdfUrl = await uploadToCloudinary(buffer, file.name);

        console.log(`✅ New PDF uploaded: ${newPdfUrl}`);

        // Update package with new PDF URL
        const updateResult = await database.collection("packages").updateOne(
            { _id: new ObjectId(packageId) },
            { 
                $set: { 
                    sourcePdf: [newPdfUrl],
                    pdfImages: [], // Reset images so they can be regenerated
                    updatedAt: new Date()
                } 
            }
        );

        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ message: "Package not found for update" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "PDF re-uploaded successfully. You can now process the package.",
            data: {
                packageId: packageId,
                newPdfUrl: newPdfUrl,
                oldPdfUrl: pkg.sourcePdf[0],
                nextSteps: [
                    "The PDF has been re-uploaded with proper access permissions",
                    "Images have been reset and will be regenerated during processing",
                    "You can now call PATCH /api/packages/{id}/process to extract questions"
                ]
            }
        });

    } catch (error) {
        console.error("Error re-uploading PDF:", error);
        return errorHandler(error);
    }
}

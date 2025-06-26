import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { database } from "@/db/config/mongodb";
import { parseImageToQuestions } from "@/helpers/parseImageToQuestions";
import { convertPdfToPngUrls } from "@/helpers/pdfToImages";
import { v2 as cloudinary } from 'cloudinary';
import errorHandler from "@/helpers/errorHandler";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

        // Check if AI processing is enabled
        if (process.env.ENABLE_AI_PROCESSING !== 'true') {
            return NextResponse.json({ message: "AI processing is not enabled on this server" }, { status: 503 });
        }

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ message: "AI processing is not configured" }, { status: 503 });
        }

        // Get the package from database
        const pkg = await database.collection("packages").findOne({
            _id: new ObjectId(packageId),
        });

        if (!pkg) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        // Check if user has permission (owner or admin)
        if (pkg.creatorId.toString() !== userId) {
            return NextResponse.json({ message: "Forbidden - You can only process your own packages" }, { status: 403 });
        }

        // Check if package has source PDF
        if (!pkg.sourcePdf || !Array.isArray(pkg.sourcePdf) || pkg.sourcePdf.length === 0) {
            return NextResponse.json({ message: "Source PDF not found in package" }, { status: 400 });
        }

        let imagesToProcess = pkg.pdfImages || [];

        // If no images exist, try to generate them from the source PDF
        if (imagesToProcess.length === 0) {
            console.log(`No images found for package ${packageId}, attempting to generate from PDF...`);
            
            try {
                // Get the first PDF URL (assuming single PDF for now)
                const pdfUrl = pkg.sourcePdf[0];
                console.log("Attempting to download PDF from:", pdfUrl);
                
                let pdfBuffer: Buffer;
                
                // Try different methods to fetch the PDF
                try {
                    // Method 1: Try direct fetch first (works for newer uploads)
                    const response = await fetch(pdfUrl);
                    if (response.ok) {
                        pdfBuffer = Buffer.from(await response.arrayBuffer());
                        console.log("✅ PDF downloaded successfully via direct fetch");
                    } else {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                } catch (fetchError) {
                    console.log("❌ Direct fetch failed:", fetchError);
                    console.log("🔄 Trying alternative methods...");
                    
                    // Method 2: If URL has /image/upload/, try converting to /raw/upload/
                    if (pdfUrl.includes('/image/upload/')) {
                        try {
                            const correctedUrl = pdfUrl.replace('/image/upload/', '/raw/upload/');
                            console.log("Trying corrected URL (raw instead of image):", correctedUrl);
                            
                            const correctedResponse = await fetch(correctedUrl);
                            if (correctedResponse.ok) {
                                pdfBuffer = Buffer.from(await correctedResponse.arrayBuffer());
                                console.log("✅ PDF downloaded successfully via corrected URL");
                            } else {
                                throw new Error(`Corrected URL failed: ${correctedResponse.status}`);
                            }
                        } catch (correctedError) {
                            console.log("❌ Corrected URL method failed:", correctedError);
                            throw correctedError;
                        }
                    } else {
                        // Method 3: Try to extract public_id from URL and use Cloudinary API                    } else {
                        // Method 3: Try to extract public_id from URL and use Cloudinary API
                        try {
                            // Extract public_id from Cloudinary URL (handle both /image/upload/ and /raw/upload/)
                            const urlMatch = pdfUrl.match(/\/(?:image|raw)\/upload\/v\d+\/(.+?)\.pdf$/);
                            if (urlMatch) {
                                const publicId = urlMatch[1];
                                console.log("Extracted public_id:", publicId);
                                
                                // Determine if this is a raw or image resource based on URL
                                const isRawResource = pdfUrl.includes('/raw/upload/');
                                const resourceType = isRawResource ? 'raw' : 'image';
                                console.log(`Using resource_type: ${resourceType}`);
                                
                                // Get resource info from Cloudinary
                                const resourceInfo = await cloudinary.api.resource(publicId, { resource_type: resourceType });
                                const authenticatedUrl = cloudinary.url(publicId, { 
                                    resource_type: resourceType,
                                    secure: true,
                                    sign_url: true,
                                    auth_token: {
                                        duration: 3600 // 1 hour
                                    }
                                });
                                
                                console.log("Trying authenticated Cloudinary URL...");
                                const authResponse = await fetch(authenticatedUrl);
                                if (authResponse.ok) {
                                    pdfBuffer = Buffer.from(await authResponse.arrayBuffer());
                                    console.log("✅ PDF downloaded successfully via authenticated Cloudinary URL");
                                } else {
                                    throw new Error(`Authenticated fetch failed: ${authResponse.status}`);
                                }
                            } else {
                                throw new Error("Could not extract public_id from Cloudinary URL");
                            }
                        } catch (cloudinaryError) {
                            console.log("❌ Cloudinary method failed:", cloudinaryError);
                            throw new Error(`All download methods failed. Original error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
                        }
                    }
                }
                
                imagesToProcess = await convertPdfToPngUrls(pdfBuffer, `package_${packageId}`);
                
                console.log(`Generated ${imagesToProcess.length} images from PDF`);
                
                // Update package with generated images
                if (imagesToProcess.length > 0) {
                    await database.collection("packages").updateOne(
                        { _id: new ObjectId(packageId) },
                        { 
                            $set: { 
                                pdfImages: imagesToProcess,
                                updatedAt: new Date()
                            } 
                        }
                    );
                }
            } catch (imageGenerationError) {
                console.error("Failed to generate images from PDF:", imageGenerationError);
                return NextResponse.json({ 
                    success: false,
                    message: "Failed to generate images from PDF",
                    error: imageGenerationError instanceof Error ? imageGenerationError.message : 'Unknown error',
                    troubleshooting: {
                        pdfUrl: pkg.sourcePdf[0],
                        suggestions: [
                            "The PDF URL might be expired or have restricted access",
                            "Try creating a new package with the same PDF file",
                            "Ensure your Cloudinary credentials are properly configured",
                            "Check if the PDF file is still accessible"
                        ]
                    }
                }, { status: 500 });
            }
        }

        // Final check - if still no images after generation attempt
        if (imagesToProcess.length === 0) {
            console.log("⚠️ No images available for AI processing");
            
            // Instead of returning error, create basic content from PDF info
            const basicContent = {
                type: "pdf_document",
                source: "direct_pdf",
                pdfUrl: pkg.sourcePdf[0],
                pageCount: "unknown",
                processedAt: new Date().toISOString(),
                note: "Images could not be generated due to system limitations. AI processing skipped."
            };
            
            // Update package with basic content
            const updateData = {
                contents: [basicContent],
                aiProcessing: {
                    processedAt: new Date(),
                    totalQuestions: 0,
                    totalImages: 0,
                    successfulImages: 0,
                    failedImages: 0,
                    processingErrors: ["PDF to image conversion unavailable - poppler not installed"],
                    note: "Package created without image conversion. Please install poppler for full AI processing."
                },
                updatedAt: new Date()
            };
            
            await database.collection("packages").updateOne(
                { _id: new ObjectId(packageId) },
                { $set: updateData }
            );
            
            return NextResponse.json({
                success: true,
                message: "Package processed without image conversion",
                data: {
                    packageId: packageId,
                    totalQuestions: 0,
                    totalImages: 0,
                    successfulImages: 0,
                    failedImages: 0,
                    processingErrors: ["PDF to image conversion unavailable"],
                    note: "Install poppler-utils for full AI processing capabilities",
                    troubleshooting: {
                        issue: "PDF to image conversion not available",
                        solution: "Install poppler-utils on your system",
                        alternativeWorkflow: "Package can still be used for manual content management"
                    }
                }
            });
        }

        console.log(`Starting AI processing for package ${packageId} with ${imagesToProcess.length} images`);

        // Process each image and collect all questions
        let allQuestions: any[] = [];
        let successCount = 0;
        let errorCount = 0;
        const processingErrors: string[] = [];

        for (let i = 0; i < imagesToProcess.length; i++) {
            const imageUrl = imagesToProcess[i];
            
            try {
                console.log(`Processing image ${i + 1}/${pkg.pdfImages.length}: ${imageUrl}`);
                
                const parsed = await parseImageToQuestions(imageUrl);
                
                if (parsed.questions && Array.isArray(parsed.questions)) {
                    // Add metadata to each question
                    const questionsWithMetadata = parsed.questions.map((question: any, questionIndex: number) => ({
                        ...question,
                        pageNumber: i + 1,
                        questionId: `page_${i + 1}_q_${questionIndex + 1}`,
                        imageUrl: imageUrl,
                        processedAt: new Date().toISOString()
                    }));
                    
                    allQuestions.push(...questionsWithMetadata);
                    successCount++;
                    console.log(`✅ Found ${parsed.questions.length} questions in image ${i + 1}`);
                } else {
                    console.log(`⚠️ No questions found in image ${i + 1}`);
                }

                // Add delay to respect OpenAI rate limits
                if (i < imagesToProcess.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
                }

            } catch (error) {
                errorCount++;
                const errorMessage = `Failed to process image ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                processingErrors.push(errorMessage);
                console.error(`❌ Error processing image ${i + 1}:`, error);
            }
        }

        // Update package with parsed questions
        const updateData = {
            contents: allQuestions,
            aiProcessing: {
                processedAt: new Date(),
                totalQuestions: allQuestions.length,
                totalImages: imagesToProcess.length,
                successfulImages: successCount,
                failedImages: errorCount,
                processingErrors: processingErrors
            },
            updatedAt: new Date()
        };

        const result = await database.collection("packages").updateOne(
            { _id: new ObjectId(packageId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Package not found for update" }, { status: 404 });
        }

        console.log(`✅ Processing complete: Found ${allQuestions.length} total questions from ${imagesToProcess.length} images`);

        return NextResponse.json({
            success: true,
            message: "Parsed and saved questions successfully",
            data: {
                packageId: packageId,
                totalQuestions: allQuestions.length,
                totalImages: imagesToProcess.length,
                successfulImages: successCount,
                failedImages: errorCount,
                processingErrors: processingErrors
            }
        });

    } catch (error) {
        console.error("Error in AI processing:", error);
        return errorHandler(error);
    }
}

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

        // Get the package from database
        const pkg = await database.collection("packages").findOne({
            _id: new ObjectId(packageId),
        });

        if (!pkg) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        // Get processing status
        const processingStatus = {
            packageId: packageId,
            hasImages: pkg.pdfImages && Array.isArray(pkg.pdfImages) && pkg.pdfImages.length > 0,
            imageCount: pkg.pdfImages ? pkg.pdfImages.length : 0,
            hasProcessedContent: pkg.contents && Array.isArray(pkg.contents) && pkg.contents.length > 0,
            contentCount: pkg.contents ? pkg.contents.length : 0,
            aiProcessingEnabled: process.env.ENABLE_AI_PROCESSING === 'true',
            openaiConfigured: !!process.env.OPENAI_API_KEY,
            lastProcessed: pkg.aiProcessing?.processedAt || null,
            totalQuestions: pkg.aiProcessing?.totalQuestions || 0,
            successfulImages: pkg.aiProcessing?.successfulImages || 0,
            failedImages: pkg.aiProcessing?.failedImages || 0,
            processingErrors: pkg.aiProcessing?.processingErrors || []
        };

        return NextResponse.json({
            success: true,
            data: processingStatus
        });

    } catch (error) {
        console.error("Error getting processing status:", error);
        return errorHandler(error);
    }
}
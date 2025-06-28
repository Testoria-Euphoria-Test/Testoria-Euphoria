import { NextResponse } from "next/server";
import { processPdfForPackage } from "@/helpers/processPdfForPackage";
import { parseImageToQuestions } from "@/helpers/parseImageToQuestions";
import PackageModel from "@/db/models/PackageModel";
import errorHandler from "@/helpers/errorHandler";
import { PackageCreateInput } from "@/types/package";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Extract query parameters
    const categoryId = searchParams.get('categoryId');
    const creatorId = searchParams.get('creatorId');
    const search = searchParams.get('search');
    const published = searchParams.get('published');
    const status = searchParams.get('status'); // New status filter: 'published', 'draft', or 'all'
    const withDetails = searchParams.get('withDetails') === 'true';

    // Build filters object
    const filters: any = {};
    if (categoryId) filters.categoryId = categoryId;
    if (creatorId) filters.creatorId = creatorId;
    if (search) filters.search = search;
    if (status && status !== 'all') filters.status = status;

    let packages;

    // If published=true, only show published packages (for customers)
    if (published === 'true') {
      packages = await PackageModel.findAllPublished(filters);
      
      return NextResponse.json({
        success: true,
        message: "Published packages retrieved successfully",
        data: packages,
        count: packages.length
      });
    }

    // Otherwise, show all packages with optional details (for admin/creator management)
    if (withDetails) {
      packages = await PackageModel.findAllWithDetails(filters);
    } else {
      packages = await PackageModel.findAll(filters);
    }

    return NextResponse.json({
      success: true,
      message: "Packages retrieved successfully",
      data: packages,
      count: packages.length
    });

  } catch (error) {
    console.error("Error fetching packages:", error);
    return errorHandler(error);
  }
}

export async function POST(req: Request) {
  try {
    // Get user info from middleware headers (requires auth)
    const userId = req.headers.get('x-user-id');
    const userEmail = req.headers.get('x-user-email');

    if (!userId) {
      throw { message: "Unauthorized - Authentication required", status: 401 };
    }

    const formData = await req.formData();
    
    // Extract and validate form fields
    const file = formData.get("file") as File;
    const title = formData.get("title")?.toString();
    const categoryId = formData.get("categoryId")?.toString();
    const duration = formData.get("duration")?.toString();
    const price = formData.get("price")?.toString();
    const description = formData.get("description")?.toString() || "";
    const contents = formData.get("contents")?.toString();
    const pdfImages = formData.get("pdfImages")?.toString();

    // Validate required fields
    if (!file) {
      throw { message: "PDF file is required", status: 400 };
    }
    if (!title) {
      throw { message: "Title is required", status: 400 };
    }
    if (!categoryId) {
      throw { message: "Category ID is required", status: 400 };
    }
    if (!duration) {
      throw { message: "Duration is required", status: 400 };
    }
    if (!price) {
      throw { message: "Price is required", status: 400 };
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      throw { message: "Only PDF files are allowed", status: 400 };
    }

    // Process PDF file
    const buffer = Buffer.from(await file.arrayBuffer());
    const { pdfUrl, pdfImages: generatedPdfImages, pageCount } = await processPdfForPackage(buffer, file.name);
    console.log(`PDF processed: ${pageCount} pages, ${generatedPdfImages.length} image URLs generated`);

    // Process images with AI to extract questions
    let allQuestions: any[] = [];
    const enableAIProcessing = process.env.ENABLE_AI_PROCESSING === 'true';
    
    console.log(`AI Processing Status:
      - ENABLE_AI_PROCESSING: ${process.env.ENABLE_AI_PROCESSING}
      - OPENAI_API_KEY exists: ${!!process.env.OPENAI_API_KEY}
      - Generated images count: ${generatedPdfImages.length}
      - AI enabled: ${enableAIProcessing}`);
    
    if (enableAIProcessing && process.env.OPENAI_API_KEY && generatedPdfImages.length > 0) {
      try {
        console.log("🚀 Starting AI question extraction...");
        
        for (let i = 0; i < generatedPdfImages.length; i++) {
          const imageUrl = generatedPdfImages[i];
          
          try {
            console.log(`🔍 Processing image ${i + 1}/${generatedPdfImages.length}: ${imageUrl}`);
            
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
              console.log(`✅ Found ${parsed.questions.length} questions in image ${i + 1}`);
            } else {
              console.log(`⚠️ No questions found in image ${i + 1} - parsed result:`, parsed);
            }

            // Add delay to respect OpenAI rate limits
            if (i < generatedPdfImages.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay for better rate limiting
            }

          } catch (imageError) {
            console.error(`❌ Error processing image ${i + 1}:`, imageError);
          }
        }
        
        console.log(`🎉 AI processing complete: Found ${allQuestions.length} total questions from ${generatedPdfImages.length} images`);
      } catch (aiError) {
        console.error("❌ AI processing failed:", aiError);
        console.warn("Continuing package creation without AI-processed questions");
      }
    } else {
      console.log(`⏭️ AI processing skipped - Reason:
        - AI enabled: ${enableAIProcessing}
        - OpenAI key configured: ${!!process.env.OPENAI_API_KEY}
        - Images available: ${generatedPdfImages.length > 0} (${generatedPdfImages.length} images)`);
    }

    // Parse optional JSON fields
    let parsedContents: any[] = [];
    let parsedPdfImages: string[] = [];

    try {
      if (contents) {
        parsedContents = JSON.parse(contents);
      }
      if (pdfImages) {
        parsedPdfImages = JSON.parse(pdfImages);
      }
    } catch (parseError) {
      throw { message: "Invalid JSON format for contents or pdfImages", status: 400 };
    }

    // Create package data with proper typing
    const packageData: PackageCreateInput = {
      title,
      categoryId,
      creatorId: userId,
      duration: parseInt(duration),
      price: parseFloat(price),
      description,
      sourcePdf: [pdfUrl],
      // Use generated images if available, otherwise use provided images, or fallback to empty array
      pdfImages: generatedPdfImages.length > 0 ? generatedPdfImages : 
                 parsedPdfImages.length > 0 ? parsedPdfImages : [],
      // Use AI-processed questions if available, otherwise use provided content, or placeholder for pending processing
      contents: allQuestions.length > 0 ? allQuestions :
                parsedContents.length > 0 ? parsedContents : 
                [{ 
                  type: "processing_pending", 
                  message: "Content will be generated via AI processing",
                  status: "pending",
                  pdfImages: generatedPdfImages.length,
                  timestamp: new Date().toISOString() 
                }], // Informative placeholder instead of empty array
      isPublished: false // Default to unpublished (draft)
    };

    // Create package with PackageModel
    const result = await PackageModel.create(packageData);

    return NextResponse.json({
      success: true,
      message: "Package created successfully",
      data: result.data
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating package:", error);
    return errorHandler(error);
  }
}

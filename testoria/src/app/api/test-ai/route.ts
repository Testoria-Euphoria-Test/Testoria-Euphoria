import { NextRequest, NextResponse } from "next/server";
import { parseImageToQuestions } from "@/helpers/parseImageToQuestions";

export async function POST(request: NextRequest) {
    try {
        // Check if AI processing is enabled
        if (process.env.ENABLE_AI_PROCESSING !== 'true') {
            return NextResponse.json({
                error: "AI processing is not enabled on this server"
            }, { status: 503 });
        }

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                error: "AI processing is not configured"
            }, { status: 503 });
        }

        const body = await request.json();
        const { imageUrl } = body;

        if (!imageUrl) {
            return NextResponse.json({
                error: "Image URL is required"
            }, { status: 400 });
        }

        console.log(`Testing AI processing for image: ${imageUrl}`);

        // Test the AI processing
        const startTime = Date.now();
        const result = await parseImageToQuestions(imageUrl);
        const processingTime = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            message: "AI processing test completed",
            data: {
                imageUrl: imageUrl,
                processingTimeMs: processingTime,
                questionsFound: result.questions.length,
                questions: result.questions
            }
        });

    } catch (error) {
        console.error("Error in AI processing test:", error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: "AI processing test failed"
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: "AI Processing Test Endpoint",
        usage: {
            method: "POST",
            body: {
                imageUrl: "https://example.com/image.png"
            },
            description: "Test AI question extraction from a single image"
        },
        configuration: {
            aiProcessingEnabled: process.env.ENABLE_AI_PROCESSING === 'true',
            openaiConfigured: !!process.env.OPENAI_API_KEY
        }
    });
}

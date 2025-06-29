import { NextRequest, NextResponse } from "next/server";
import { parseImageToQuestions } from "@/helpers/parseImageToQuestions";
import { generateFeedback } from "@/helpers/feedbackAI";

export async function POST(request: NextRequest) {
  try {
    // Check if AI processing is enabled
    if (process.env.ENABLE_AI_PROCESSING !== "true") {
      return NextResponse.json(
        {
          error: "AI processing is not enabled on this server",
        },
        { status: 503 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "AI processing is not configured",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { imageUrl, questions, answers, score } = body;

    // Check if this is a feedback generation request
    if (questions && answers && typeof score === "number") {
      console.log(`🤖 Generating AI feedback for score: ${score}`);

      const startTime = Date.now();
      const feedback = await generateFeedback({ questions, answers, score });
      const processingTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        message: "AI feedback generated successfully",
        feedback: feedback,
        processingTimeMs: processingTime,
      });
    }

    // Otherwise, handle image processing (existing functionality)
    if (!imageUrl) {
      return NextResponse.json(
        {
          error:
            "Either imageUrl (for question extraction) or questions+answers+score (for feedback) is required",
        },
        { status: 400 }
      );
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
        questions: result.questions,
      },
    });
  } catch (error) {
    console.error("Error in AI processing test:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "AI processing test failed",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AI Processing Test Endpoint",
    usage: [
      {
        method: "POST",
        body: {
          imageUrl: "https://example.com/image.png",
        },
        description: "Test AI question extraction from a single image",
      },
      {
        method: "POST",
        body: {
          questions: "array of question objects",
          answers: "array of user answer objects",
          score: "numeric score (0-100)",
        },
        description: "Generate AI feedback based on user answers",
      },
    ],
    configuration: {
      aiProcessingEnabled: process.env.ENABLE_AI_PROCESSING === "true",
      openaiConfigured: !!process.env.OPENAI_API_KEY,
    },
  });
}

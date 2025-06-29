import { NextRequest, NextResponse } from "next/server";
import UserAnswerModel from "@/db/models/UserAnswerModel";
import ResultModel from "@/db/models/ResultModel";
import QuestionModel from "@/db/models/QuestionModel";
import PackageModel from "@/db/models/PackageModel";
import { generateFeedback } from "@/helpers/feedbackAI";

export async function POST(req: NextRequest) {
  try {
    // Get userId from middleware header
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { packageId } = await req.json();

    // Validate required fields
    if (!packageId) {
      return NextResponse.json(
        {
          error: "Missing required field: packageId",
        },
        { status: 400 }
      );
    }

    // Get package to extract duration
    const packageData = await PackageModel.findById(packageId);
    if (!packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Get user answers and questions
    const answers = await UserAnswerModel.findByUserAndPackage(
      userId,
      packageId
    );
    const questions = await QuestionModel.findByPackageId(packageId);

    if (!answers || answers.length === 0) {
      return NextResponse.json(
        {
          error: "No answers found. Please submit answers first.",
        },
        { status: 400 }
      );
    } // Calculate results
    const totalQuestions = questions.length;
    const totalCorrect = answers.filter(
      (a: { isCorrect: boolean }) => a.isCorrect
    ).length;
    const totalWrong = answers.filter(
      (a: { isCorrect: boolean }) => !a.isCorrect
    ).length;
    const totalAnswered = answers.length;
    const totalUnanswered = totalQuestions - totalAnswered;
    const score =
      totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;

    // Use package duration instead of request body
    const durationTaken = packageData.duration || 0; // minutes

    // Generate Feedback via OpenAI
    let feedback = "Great job completing the quiz!";
    try {
      feedback = await generateFeedback({ questions, answers, score });
    } catch (aiError) {
      console.error("AI feedback generation error:", aiError);
      // Fallback feedback based on score
      if (score >= 80) {
        feedback =
          "Excellent work! You demonstrated strong understanding of the material.";
      } else if (score >= 60) {
        feedback =
          "Good effort! Consider reviewing the topics you missed to strengthen your knowledge.";
      } else {
        feedback =
          "Keep practicing! Review the material and try again to improve your understanding.";
      }
    }

    const resultData = {
      userId,
      packageId,
      score,
      totalCorrect,
      totalWrong,
      totalUnanswered,
      durationTaken,
      feedback,
    };

    // Check if result already exists
    const existingResult = await ResultModel.findByUserAndPackage(
      userId,
      packageId
    );
    if (existingResult) {
      return NextResponse.json(
        {
          error: "Result already exists for this package",
          existingResult,
        },
        { status: 409 }
      );
    }

    const result = await ResultModel.create(resultData);

    return NextResponse.json({
      message: "Result created successfully",
      result: {
        ...result,
        packageTitle: packageData.title,
      },
    });
  } catch (error) {
    console.error("Result creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get userId from middleware header
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        {
          error: "Authentication required",
          success: false,
        },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const packageId = url.searchParams.get("packageId");

    // Validate packageId format if provided
    if (packageId && !packageId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        {
          error: "Invalid package ID format",
          success: false,
        },
        { status: 400 }
      );
    }

    let results;
    if (packageId) {
      // Get specific result for user and package
      const result = await ResultModel.findByUserAndPackage(userId, packageId);
      if (!result) {
        return NextResponse.json(
          {
            error: "No result found for this package",
            success: false,
            results: [],
            count: 0,
          },
          { status: 404 }
        );
      }
      results = [result];
    } else {
      // Get all results for user
      results = await ResultModel.findByUser(userId);
    }

    return NextResponse.json({
      success: true,
      results: results || [],
      count: results ? results.length : 0,
    });
  } catch (error) {
    console.error("Results retrieval error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
        results: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}

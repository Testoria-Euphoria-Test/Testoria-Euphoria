import { NextRequest, NextResponse } from "next/server";
import QuestionModel from "@/db/models/QuestionModel";
import UserAnswerModel from "@/db/models/UserAnswerModel";

export async function POST(req: NextRequest) {
    try {
        // Get userId from middleware header
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const { packageId, answers } = await req.json(); // answers: [{questionId, selectedAnswer}]

        // Validate required fields
        if (!packageId || !answers || !Array.isArray(answers)) {
            return NextResponse.json({ 
                error: "Missing required fields: packageId and answers array" 
            }, { status: 400 });
        }

        const validatedAnswers = await Promise.all(
            answers.map(async (ans: any) => {
                if (!ans.questionId || !ans.selectedAnswer) {
                    throw new Error("Each answer must have questionId and selectedAnswer");
                }
                
                const question = await QuestionModel.findById(ans.questionId);
                if (!question) {
                    throw new Error(`Question not found: ${ans.questionId}`);
                }
                
                const isCorrect = question.correctAnswer === ans.selectedAnswer;
                return {
                    userId,
                    packageId,
                    questionId: ans.questionId,
                    selectedAnswer: ans.selectedAnswer,
                    isCorrect,
                };
            })
        );

        const result = await UserAnswerModel.submitMany(validatedAnswers);

        return NextResponse.json({ 
            message: "Answers submitted successfully",
            submittedCount: validatedAnswers.length,
            submissionId: result.insertedIds
        });
    } catch (error) {
        console.error("User answers submission error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        // Get userId from middleware header
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const url = new URL(req.url);
        const packageId = url.searchParams.get('packageId');
        
        if (!packageId) {
            return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
        }

        const userAnswers = await UserAnswerModel.findByUserAndPackage(userId, packageId);
        
        return NextResponse.json({ 
            userAnswers,
            count: userAnswers.length,
            packageId,
            userId
        });
    } catch (error) {
        console.error("User answers retrieval error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
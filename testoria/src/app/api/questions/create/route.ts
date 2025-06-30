import { NextRequest, NextResponse } from 'next/server';
import QuestionModel from '@/db/models/QuestionModel';
import { database } from '@/db/config/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
    try {
        // Get userId from middleware header
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const body = await req.json();

        // Validate required fields
        if (!body.packageId || !body.questionText || !body.correctAnswer) {
            return NextResponse.json({
                error: "Missing required fields: packageId, questionText, and correctAnswer are required"
            }, { status: 400 });
        }

        // Get package to check ownership
        const pkg = await database.collection("packages").findOne({
            _id: new ObjectId(body.packageId)
        });

        if (!pkg) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }

        // Check if user owns the package
        if (pkg.creatorId.toString() !== userId) {
            return NextResponse.json({ error: "Unauthorized: You can only create questions for your own packages" }, { status: 403 });
        }

        // Prepare question data
        const questionData = {
            packageId: body.packageId,
            questionText: body.questionText,
            optionA: body.optionA || "",
            optionB: body.optionB || "",
            optionC: body.optionC || "",
            optionD: body.optionD || "",
            optionE: body.optionE || "",
            correctAnswer: body.correctAnswer,
            explanation: body.explanation || "",
            passage: body.passage || "",
            imagePrompt: body.imagePrompt || "",
            images: [] // Empty array for now, images can be added later
        };

        // Create question
        const questionId = await QuestionModel.create(questionData);

        // Get the created question to return full data
        const createdQuestion = await QuestionModel.findById(questionId.toString());

        return NextResponse.json({
            success: true,
            message: "Question created successfully",
            data: createdQuestion
        });

    } catch (error) {
        console.error("Question creation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

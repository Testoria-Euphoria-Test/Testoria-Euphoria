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

        // Validate required fields for manual question creation
        if (!body.packageId || !body.questionText || !body.correctAnswer) {
            return NextResponse.json({
                error: "Missing required fields: packageId, questionText, correctAnswer"
            }, { status: 400 });
        }

        // Get package to verify ownership
        const pkg = await database.collection("packages").findOne({
            _id: new ObjectId(body.packageId)
        });

        if (!pkg) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }

        // Check if user owns the package (creator) or is admin
        const userRole = req.headers.get('x-user-role');
        const isOwner = pkg.creatorId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Unauthorized: You can only create questions for your own packages or you must be an admin" }, { status: 403 });
        }

        // Create single question manually
        const questionId = await QuestionModel.create({
            packageId: body.packageId,
            questionText: body.questionText,
            optionA: body.optionA || "",
            optionB: body.optionB || "",
            optionC: body.optionC || "",
            optionD: body.optionD || "",
            optionE: body.optionE || "",
            correctAnswer: body.correctAnswer,
            explanation: body.explanation || "",
            images: body.images || []
        });

        return NextResponse.json({
            message: 'Question created successfully',
            questionId: questionId.toString()
        });

    } catch (error) {
        console.error("Manual question creation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        // Get userId from middleware header
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const body = await req.json();

        // Validate required fields
        if (!body.questionId) {
            return NextResponse.json({
                error: "Missing required field: questionId"
            }, { status: 400 });
        }

        // Get question to verify ownership via package
        const question = await QuestionModel.findById(body.questionId);
        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        // Get package to verify ownership
        const pkg = await database.collection("packages").findOne({
            _id: question.packageId
        });

        if (!pkg) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }

        // Check if user owns the package (creator) or is admin
        const userRole = req.headers.get('x-user-role');
        const isOwner = pkg.creatorId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Unauthorized: You can only edit questions for your own packages or you must be an admin" }, { status: 403 });
        }

        // Update question
        const updateData: any = {
            questionText: body.questionText,
            optionA: body.optionA,
            optionB: body.optionB,
            optionC: body.optionC,
            optionD: body.optionD,
            optionE: body.optionE,
            correctAnswer: body.correctAnswer,
            explanation: body.explanation,
            images: body.images
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const updated = await QuestionModel.updateById(body.questionId, updateData);

        if (!updated) {
            return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Question updated successfully',
            questionId: body.questionId
        });

    } catch (error) {
        console.error("Question update error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        // Get userId from middleware header
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const url = new URL(req.url);
        const questionId = url.searchParams.get('questionId');

        if (!questionId) {
            return NextResponse.json({
                error: "Missing required parameter: questionId"
            }, { status: 400 });
        }

        // Get question to verify ownership via package
        const question = await QuestionModel.findById(questionId);
        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        // Get package to verify ownership
        const pkg = await database.collection("packages").findOne({
            _id: question.packageId
        });

        if (!pkg) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }

        // Check if user owns the package (creator) or is admin
        const userRole = req.headers.get('x-user-role');
        const isOwner = pkg.creatorId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Unauthorized: You can only delete questions for your own packages or you must be an admin" }, { status: 403 });
        }

        // Delete question
        const deleted = await QuestionModel.deleteById(questionId);

        if (!deleted) {
            return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Question deleted successfully',
            questionId: questionId
        });

    } catch (error) {
        console.error("Question deletion error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import QuestionModel from '@/db/models/QuestionModel';
import { database } from '@/db/config/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get userId from middleware header
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const body = await req.json();

        // Get the question to check ownership
        const existingQuestion = await database.collection("questions").findOne({
            _id: new ObjectId(id)
        });

        if (!existingQuestion) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        // Get package to check ownership
        const pkg = await database.collection("packages").findOne({
            _id: new ObjectId(existingQuestion.packageId)
        });

        if (!pkg) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }

        // Check if user owns the package or is admin
        const userRole = req.headers.get('x-user-role');
        const isOwner = pkg.creatorId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Unauthorized: You can only edit questions for your own packages or you must be an admin" }, { status: 403 });
        }

        // Validate required fields
        if (!body.questionText || !body.correctAnswer) {
            return NextResponse.json({
                error: "Missing required fields: questionText and correctAnswer are required"
            }, { status: 400 });
        }

        // Prepare update data
        const updateData = {
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
            updatedAt: new Date().toISOString()
        };

        // Update question
        const result = await QuestionModel.updateById(id, updateData);

        return NextResponse.json({
            success: true,
            message: "Question updated successfully",
            data: result
        });

    } catch (error) {
        console.error("Question update error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get userId from middleware header
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        // Get the question to check ownership
        const existingQuestion = await database.collection("questions").findOne({
            _id: new ObjectId(id)
        });

        if (!existingQuestion) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        // Get package to check ownership
        const pkg = await database.collection("packages").findOne({
            _id: new ObjectId(existingQuestion.packageId)
        });

        if (!pkg) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }

        // Check if user owns the package or is admin
        const userRole = req.headers.get('x-user-role');
        const isOwner = pkg.creatorId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Unauthorized: You can only delete questions for your own packages or you must be an admin" }, { status: 403 });
        }

        // Delete question
        const result = await QuestionModel.deleteById(id);

        return NextResponse.json({
            success: true,
            message: "Question deleted successfully",
            data: result
        });

    } catch (error) {
        console.error("Question deletion error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

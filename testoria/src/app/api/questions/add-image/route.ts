import { NextRequest, NextResponse } from 'next/server';
import QuestionModel from '@/db/models/QuestionModel';
import { database } from '@/db/config/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
    try {
        // Get user info from middleware headers (requires auth)
        const userId = request.headers.get('x-user-id');
        const userRole = request.headers.get('x-user-role');

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { questionId, imageUrl } = body;

        if (!questionId || !imageUrl) {
            return NextResponse.json(
                { success: false, message: 'Question ID and image URL are required' },
                { status: 400 }
            );
        }

        // Validate URL format
        try {
            new URL(imageUrl);
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid image URL format' },
                { status: 400 }
            );
        }

        // Get current question
        const question = await QuestionModel.findById(questionId);
        if (!question) {
            return NextResponse.json(
                { success: false, message: 'Question not found' },
                { status: 404 }
            );
        }

        // Get package to verify ownership
        const pkg = await database.collection("packages").findOne({
            _id: new ObjectId(question.packageId)
        });

        if (!pkg) {
            return NextResponse.json(
                { success: false, message: 'Package not found' },
                { status: 404 }
            );
        }

        // Check if user owns the package (creator) or is admin
        const isOwner = pkg.creatorId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: You can only modify questions for your own packages or you must be an admin' },
                { status: 403 }
            );
        }

        // Add image URL to question's images array
        const currentImages = question.images || [];
        const updatedImages = [...currentImages, imageUrl];

        // Update question with new image
        const updateResult = await QuestionModel.updateById(questionId, {
            images: updatedImages
        });

        if (!updateResult) {
            return NextResponse.json(
                { success: false, message: 'Failed to update question' },
                { status: 500 }
            );
        }

        console.log(`✅ Manual image URL added to question ${questionId}: ${imageUrl}`);

        return NextResponse.json({
            success: true,
            data: {
                questionId,
                imageUrl,
                totalImages: updatedImages.length
            }
        });

    } catch (error) {
        console.error('Error adding manual image URL:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to add image URL'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Get user info from middleware headers (requires auth)
        const userId = request.headers.get('x-user-id');
        const userRole = request.headers.get('x-user-role');

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { questionId, imageUrl } = body;

        if (!questionId || !imageUrl) {
            return NextResponse.json(
                { success: false, message: 'Question ID and image URL are required' },
                { status: 400 }
            );
        }

        // Get current question
        const question = await QuestionModel.findById(questionId);
        if (!question) {
            return NextResponse.json(
                { success: false, message: 'Question not found' },
                { status: 404 }
            );
        }

        // Get package to verify ownership
        const pkg = await database.collection("packages").findOne({
            _id: new ObjectId(question.packageId)
        });

        if (!pkg) {
            return NextResponse.json(
                { success: false, message: 'Package not found' },
                { status: 404 }
            );
        }

        // Check if user owns the package (creator) or is admin
        const isOwner = pkg.creatorId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: You can only modify questions for your own packages or you must be an admin' },
                { status: 403 }
            );
        }

        // Remove image URL from question's images array
        const currentImages = question.images || [];
        const updatedImages = currentImages.filter((url: string) => url !== imageUrl);

        // Update question
        const updateResult = await QuestionModel.updateById(questionId, {
            images: updatedImages
        });

        if (!updateResult) {
            return NextResponse.json(
                { success: false, message: 'Failed to update question' },
                { status: 500 }
            );
        }

        console.log(`✅ Image URL removed from question ${questionId}: ${imageUrl}`);

        return NextResponse.json({
            success: true,
            data: {
                questionId,
                removedImageUrl: imageUrl,
                totalImages: updatedImages.length
            }
        });

    } catch (error) {
        console.error('Error removing image URL:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to remove image URL'
            },
            { status: 500 }
        );
    }
}

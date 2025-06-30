import { NextRequest, NextResponse } from 'next/server';
import QuestionModel from '@/db/models/QuestionModel';

export async function POST(request: NextRequest) {
    try {
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

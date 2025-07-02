import { NextRequest, NextResponse } from 'next/server';
import { generateImageFromPrompt } from '@/helpers/generateImage';
import { uploadToCloudinary } from '@/helpers/uploadToCloudinary';
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
        const { imagePrompt, questionId } = body;

        if (!imagePrompt || !questionId) {
            return NextResponse.json(
                { success: false, message: 'Image prompt and question ID are required' },
                { status: 400 }
            );
        }

        // Get current question to verify ownership
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
                { success: false, message: 'Unauthorized: You can only generate images for your own packages or you must be an admin' },
                { status: 403 }
            );
        }

        console.log(`🎨 Generating image for question ${questionId} with prompt: "${imagePrompt}"`);

        // Generate image using OpenAI DALL-E
        const imageUrl = await generateImageFromPrompt(imagePrompt);

        // Download the image and upload to Cloudinary for permanent storage
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error('Failed to download generated image');
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(imageBuffer);

        // Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(buffer, `question-${questionId}-generated.png`);

        console.log(`✅ Image generated and uploaded successfully for question ${questionId}`);

        return NextResponse.json({
            success: true,
            data: {
                originalUrl: imageUrl,
                cloudinaryUrl: cloudinaryUrl,
                questionId: questionId
            }
        });

    } catch (error) {
        console.error('Error in image generation API:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to generate image'
            },
            { status: 500 }
        );
    }
}

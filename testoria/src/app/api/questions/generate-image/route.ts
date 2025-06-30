import { NextRequest, NextResponse } from 'next/server';
import { generateImageFromPrompt } from '@/helpers/generateImage';
import { uploadToCloudinary } from '@/helpers/uploadToCloudinary';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { imagePrompt, questionId } = body;

        if (!imagePrompt || !questionId) {
            return NextResponse.json(
                { success: false, message: 'Image prompt and question ID are required' },
                { status: 400 }
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

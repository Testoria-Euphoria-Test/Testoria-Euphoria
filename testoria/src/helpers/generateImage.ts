import { openai } from './openai';

export interface ImageGenerationRequest {
    prompt: string;
    size?: '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
}

export interface ImageGenerationResult {
    url: string;
    revisedPrompt?: string;
}

export async function generateImage({
    prompt,
    size = '1024x1024',
    quality = 'standard',
    style = 'natural'
}: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
        console.log(`🎨 Generating image with prompt: "${prompt.substring(0, 100)}..."`);

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            size: size,
            quality: quality,
            style: style,
            n: 1,
        });

        if (!response.data || response.data.length === 0) {
            throw new Error('No image generated from OpenAI');
        }

        const imageData = response.data[0];

        if (!imageData.url) {
            throw new Error('No image URL returned from OpenAI');
        }

        console.log(`✅ Image generated successfully`);

        return {
            url: imageData.url,
            revisedPrompt: imageData.revised_prompt
        };
    } catch (error) {
        console.error('Error generating image:', error);
        throw new Error(
            error instanceof Error
                ? `Image generation failed: ${error.message}`
                : 'Image generation failed'
        );
    }
}

export async function generateImageFromPrompt(imagePrompt: string): Promise<string> {
    try {
        // Enhance the prompt for better educational content
        const enhancedPrompt = `Create an educational illustration: ${imagePrompt}. 
        Style: Clean, clear, educational diagram suitable for learning materials. 
        High contrast, well-labeled if applicable, professional appearance.`;

        const result = await generateImage({
            prompt: enhancedPrompt,
            size: '1024x1024',
            quality: 'standard',
            style: 'natural'
        });

        return result.url;
    } catch (error) {
        console.error('Error generating image from prompt:', error);
        throw error;
    }
}

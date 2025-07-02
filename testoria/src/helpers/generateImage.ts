import { openai } from './openai';

export interface ImageGenerationRequest {
    prompt: string;
    size?: '1024x1024' | '1792x1024' | '1024x1792';
}

export interface ImageGenerationResult {
    url: string;
    revisedPrompt?: string;
}

export async function generateImage({
    prompt,
    size = '1024x1024'
}: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
        console.log(`🎨 Generating image with prompt: "${prompt.substring(0, 100)}..."`);

        // Try different approaches for gpt-image-1 model
        let response;
        
        try {
            // First try: Standard images.generate API with gpt-image-1
            response = await openai.images.generate({
                model: "gpt-image-1",
                prompt: prompt,
                size: size,
                n: 1,
            });
        } catch (error: any) {
            console.log('First attempt failed, trying alternative approach...');
            
            // Second try: Check if it's a chat completion model that generates images
            if (error.message?.includes('Unknown parameter') || error.message?.includes('model')) {
                try {
                    const chatResponse = await openai.chat.completions.create({
                        model: "gpt-image-1",
                        messages: [
                            {
                                role: "user",
                                content: `Generate an image: ${prompt}`
                            }
                        ],
                        max_tokens: 300,
                    });
                    
                    console.log('Chat Response:', JSON.stringify(chatResponse, null, 2));
                    
                    // Extract image URL from chat response if available
                    const content = chatResponse.choices[0]?.message?.content;
                    if (content) {
                        // Look for URL patterns in the response
                        const urlMatch = content.match(/https?:\/\/[^\s]+/g);
                        if (urlMatch && urlMatch[0]) {
                            return {
                                url: urlMatch[0],
                                revisedPrompt: prompt
                            };
                        }
                    }
                    
                    throw new Error('No image URL found in chat response');
                } catch (chatError) {
                    console.error('Chat approach also failed:', chatError);
                    throw error; // Re-throw original error
                }
            } else {
                throw error;
            }
        }

        console.log('OpenAI Response:', JSON.stringify(response, null, 2));

        if (!response.data || response.data.length === 0) {
            throw new Error('No image generated from OpenAI');
        }

        const imageData = response.data[0];
        console.log('Image data:', JSON.stringify(imageData, null, 2));

        // Check different possible URL properties - use any type to access unknown properties
        const imageDataAny = imageData as any;
        let imageUrl = null;
        
        if (imageData.url) {
            imageUrl = imageData.url;
        } else if (imageDataAny.image_url) {
            imageUrl = imageDataAny.image_url;
        } else if (imageDataAny.image) {
            imageUrl = imageDataAny.image;
        } else if (imageDataAny.data) {
            // Check if data contains base64 image
            if (typeof imageDataAny.data === 'string' && imageDataAny.data.startsWith('data:image')) {
                imageUrl = imageDataAny.data;
            }
        } else if (imageData.b64_json) {
            // Convert base64 to data URL
            imageUrl = `data:image/png;base64,${imageData.b64_json}`;
        }

        console.log('Extracted image URL:', imageUrl);

        if (!imageUrl) {
            console.error('Available properties in imageData:', Object.keys(imageDataAny));
            throw new Error(`No image URL found in response. Available properties: ${Object.keys(imageDataAny).join(', ')}`);
        }

        console.log(`✅ Image generated successfully`);

        return {
            url: imageUrl,
            revisedPrompt: imageDataAny.revised_prompt || prompt
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
            size: '1024x1024'
        });

        return result.url;
    } catch (error) {
        console.error('Error generating image from prompt:', error);
        throw error;
    }
}

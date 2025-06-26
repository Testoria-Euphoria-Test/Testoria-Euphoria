import { parseImageToQuestions, QuestionParseResult, ParsedQuestion } from "./parseImageToQuestions";

export interface ProcessedPackageContent {
    totalImages: number;
    totalQuestions: number;
    questionsPerImage: number[];
    allQuestions: ParsedQuestion[];
    processingErrors: string[];
}

/**
 * Process all PDF images to extract questions using AI
 */
export async function processPackageImages(imageUrls: string[]): Promise<ProcessedPackageContent> {
    const result: ProcessedPackageContent = {
        totalImages: imageUrls.length,
        totalQuestions: 0,
        questionsPerImage: [],
        allQuestions: [],
        processingErrors: []
    };

    if (!imageUrls || imageUrls.length === 0) {
        return result;
    }

    console.log(`Processing ${imageUrls.length} images for question extraction...`);

    // Process each image sequentially to avoid rate limiting
    for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];

        try {
            console.log(`Processing image ${i + 1}/${imageUrls.length}: ${imageUrl}`);

            const questionResult: QuestionParseResult = await parseImageToQuestions(imageUrl);

            if (questionResult.questions && questionResult.questions.length > 0) {
                // Add page number to each question for reference
                const questionsWithPage = questionResult.questions.map((question, questionIndex) => ({
                    ...question,
                    pageNumber: i + 1,
                    questionId: `page_${i + 1}_q_${questionIndex + 1}`,
                    imageUrl: imageUrl
                }));

                result.allQuestions.push(...questionsWithPage);
                result.questionsPerImage.push(questionResult.questions.length);

                console.log(`✅ Found ${questionResult.questions.length} questions in image ${i + 1}`);
            } else {
                result.questionsPerImage.push(0);
                console.log(`⚠️ No questions found in image ${i + 1}`);
            }

            // Add delay to respect OpenAI rate limits
            if (i < imageUrls.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
            }

        } catch (error) {
            const errorMessage = `Failed to process image ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            result.processingErrors.push(errorMessage);
            result.questionsPerImage.push(0);

            console.error(`❌ Error processing image ${i + 1}:`, error);
        }
    }

    result.totalQuestions = result.allQuestions.length;

    console.log(`✅ Processing complete: Found ${result.totalQuestions} total questions from ${result.totalImages} images`);

    if (result.processingErrors.length > 0) {
        console.warn(`⚠️ Encountered ${result.processingErrors.length} errors during processing`);
    }

    return result;
}

/**
 * Format questions for package content storage
 */
export function formatQuestionsForPackage(processedContent: ProcessedPackageContent): any[] {
    const packageContent: any[] = [];

    // Add summary information
    packageContent.push({
        type: "summary",
        data: {
            totalImages: processedContent.totalImages,
            totalQuestions: processedContent.totalQuestions,
            questionsPerImage: processedContent.questionsPerImage,
            processingErrors: processedContent.processingErrors
        }
    });

    // Group questions by page
    const questionsByPage: { [page: number]: any[] } = {};

    processedContent.allQuestions.forEach(question => {
        const pageNum = (question as any).pageNumber || 1;
        if (!questionsByPage[pageNum]) {
            questionsByPage[pageNum] = [];
        }
        questionsByPage[pageNum].push({
            type: "question",
            data: {
                id: (question as any).questionId,
                questionText: question.questionText,
                options: question.options,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
                imageUrl: (question as any).imageUrl
            }
        });
    });

    // Add questions organized by page
    Object.keys(questionsByPage)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach(pageNum => {
            packageContent.push({
                type: "page",
                pageNumber: parseInt(pageNum),
                questions: questionsByPage[parseInt(pageNum)]
            });
        });

    return packageContent;
}

/**
 * Batch process with error recovery
 */
export async function processPackageImagesWithRetry(
    imageUrls: string[],
    maxRetries: number = 2
): Promise<ProcessedPackageContent> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${maxRetries} to process package images...`);
            const result = await processPackageImages(imageUrls);

            // Consider it successful if we got at least some questions or no errors
            if (result.totalQuestions > 0 || result.processingErrors.length === 0) {
                return result;
            }

            // If we got no questions and have errors, retry
            if (attempt < maxRetries) {
                console.log(`Retrying in 2 seconds... (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');
            console.error(`Attempt ${attempt} failed:`, error);

            if (attempt < maxRetries) {
                console.log(`Retrying in 2 seconds... (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    // If all attempts failed, return empty result with error
    return {
        totalImages: imageUrls.length,
        totalQuestions: 0,
        questionsPerImage: new Array(imageUrls.length).fill(0),
        allQuestions: [],
        processingErrors: [`All ${maxRetries} attempts failed. Last error: ${lastError?.message || 'Unknown error'}`]
    };
}

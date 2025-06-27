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
        if (!body.packageId) {
            return NextResponse.json({ 
                error: "Missing required field: packageId" 
            }, { status: 400 });
        }

        // Get package to extract content
        const pkg = await database.collection("packages").findOne({ 
            _id: new ObjectId(body.packageId) 
        });

        if (!pkg) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }

        // Check if user owns the package (creator)
        if (pkg.creatorId.toString() !== userId) {
            return NextResponse.json({ error: "Unauthorized: You can only create questions for your own packages" }, { status: 403 });
        }

        // Check if package has content
        if (!pkg.contents || pkg.contents.length === 0) {
            return NextResponse.json({ 
                error: "Package has no content. Please process the package with AI first." 
            }, { status: 400 });
        }

        // Extract questions from package content
        const questionsToCreate = [];
        let questionCount = 0;
        let questionNumber = 1; // Add numbering for easy reading

        // Handle both content structures:
        // 1. Direct questions in contents array (current structure)
        // 2. Nested structure with type: "question" and questions array
        
        for (const contentItem of pkg.contents) {
            let questionsToProcess = [];
            
            // Check if it's a direct question object
            if (contentItem.questionText && contentItem.options && contentItem.correctAnswer) {
                questionsToProcess = [contentItem];
            }
            // Check if it's a nested structure with type: "question"
            else if (contentItem.type === "question" && contentItem.questions) {
                questionsToProcess = contentItem.questions;
            }

            // Process the questions
            for (const question of questionsToProcess) {
                // Map from package content format to question format
                const questionData = {
                    packageId: body.packageId,
                    questionText: question.questionText,
                    optionA: question.options?.A || question.optionA || "",
                    optionB: question.options?.B || question.optionB || "",
                    optionC: question.options?.C || question.optionC || "",
                    optionD: question.options?.D || question.optionD || "",
                    optionE: question.options?.E || question.optionE || "",
                    correctAnswer: question.correctAnswer,
                    explanation: question.explanation || "",
                    images: [] // Always empty - for manual image additions only
                };

                // Validate that required fields exist
                if (questionData.questionText && questionData.correctAnswer) {
                    try {
                        const questionId = await QuestionModel.create(questionData);
                        questionsToCreate.push({
                            number: questionNumber,
                            questionId: questionId.toString(),
                            packageId: questionData.packageId,
                            questionText: questionData.questionText,
                            optionA: questionData.optionA,
                            optionB: questionData.optionB,
                            optionC: questionData.optionC,
                            optionD: questionData.optionD,
                            optionE: questionData.optionE,
                            correctAnswer: questionData.correctAnswer,
                            explanation: questionData.explanation,
                            images: questionData.images,
                            pageNumber: question.pageNumber || null,
                            sourceQuestionId: question.questionId || null
                        });
                        questionCount++;
                        questionNumber++;
                    } catch (createError) {
                        console.error("Error creating individual question:", createError);
                        // Continue with other questions even if one fails
                    }
                }
            }
        }

        if (questionCount === 0) {
            // Provide detailed error information
            const contentInfo = pkg.contents.map((item: any, index: number) => ({
                index,
                hasQuestionText: !!item.questionText,
                hasOptions: !!item.options,
                hasCorrectAnswer: !!item.correctAnswer,
                type: item.type || 'direct_question',
                keys: Object.keys(item)
            }));

            console.log("Package content analysis:", JSON.stringify(contentInfo, null, 2));
            
            return NextResponse.json({ 
                error: "No valid questions found in package content",
                debug: {
                    contentItemsCount: pkg.contents.length,
                    contentAnalysis: contentInfo,
                    hint: "Questions need 'questionText', 'options', and 'correctAnswer' fields"
                }
            }, { status: 400 });
        }

        return NextResponse.json({ 
            message: `${questionCount} questions created successfully from package content`,
            questionsCreated: questionCount,
            packageId: body.packageId,
            summary: {
                totalQuestions: questionCount,
                packageId: body.packageId,
                createdAt: new Date().toISOString()
            },
            questions: questionsToCreate
        });

    } catch (error) {
        console.error("Question creation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const packageId = url.searchParams.get('packageId');
        
        if (!packageId) {
            return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
        }

        const questions = await QuestionModel.findByPackageId(packageId);
        return NextResponse.json({ 
            questions,
            count: questions.length 
        });
    } catch (error) {
        console.error("Questions retrieval error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
// Types for question parsing
export interface QuestionOption {
    A: string;
    B: string;
    C: string;
    D: string;
    E?: string; // Optional 5th option
}

/**
 * Helper function to auto-detect if questions need passage based on their content
 */
function shouldHavePassage(questions: ParsedQuestion[]): boolean {
    const textReferenceKeywords = [
        // Indonesian
        'berdasarkan teks', 'menurut bacaan', 'dari teks', 'sesuai teks', 'teks di atas',
        'bacaan di atas', 'dalam teks', 'pada teks', 'dari cerita', 'dalam cerita',
        'tokoh dalam', 'karakter dalam', 'pesan dalam teks', 'isi teks', 'makna teks',
        
        // English
        'according to the text', 'based on the passage', 'in the text', 'from the text',
        'the passage states', 'according to the passage', 'in the story', 'from the story',
        'the author', 'the narrator', 'the character', 'main character'
    ];

    return questions.some(q => {
        const text = q.questionText.toLowerCase();
        return textReferenceKeywords.some(keyword => text.includes(keyword.toLowerCase()));
    });
}

/**
 * Advanced function to attempt extraction of reading passage from raw AI response
 */
function extractPassageFromRawText(rawText: string): string {
    // Look for common patterns that indicate reading passages
    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Strategy 1: Look for continuous paragraphs before questions start
    const questionStartIndex = lines.findIndex(line => 
        /^\d+\./.test(line) || // Lines starting with "1.", "2.", etc.
        line.toLowerCase().includes('question') ||
        line.toLowerCase().includes('pertanyaan')
    );
    
    if (questionStartIndex > 0) {
        const potentialPassage = lines.slice(0, questionStartIndex).join(' ').trim();
        if (potentialPassage.length > 50) { // At least 50 characters for a meaningful passage
            return potentialPassage;
        }
    }
    
    // Strategy 2: Look for text between common passage markers
    const passageMarkers = [
        'passage:',
        'teks:',
        'reading passage:',
        'passage:',
        'text:',
        'cerita:'
    ];
    
    for (const marker of passageMarkers) {
        const markerIndex = rawText.toLowerCase().indexOf(marker.toLowerCase());
        if (markerIndex !== -1) {
            const textAfterMarker = rawText.substring(markerIndex + marker.length);
            const nextQuestionMatch = textAfterMarker.match(/\n\s*\d+\./);
            
            if (nextQuestionMatch) {
                const passage = textAfterMarker.substring(0, nextQuestionMatch.index).trim();
                if (passage.length > 30) {
                    return passage;
                }
            }
        }
    }
    
    return '';
}

/**
 * Secondary analysis function to extract only reading passages when main extraction missed them
 */
async function extractPassageSecondary(imageUrl: string): Promise<string> {
    try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `URGENT: You are looking for READING PASSAGES ONLY. Ignore questions and answer choices.

Your ONLY task is to find and extract ANY text passages, stories, articles, or reading material in this image.

Look for:
- Paragraphs at the top of the page
- Stories or narratives
- Article excerpts
- Dialogues between characters
- Any continuous text that is NOT part of questions or answer choices
- Text in boxes or highlighted sections
- Short passages (even 1-2 paragraphs count!)

SCAN THE ENTIRE IMAGE methodically:
1. Top section first
2. Left to right, top to bottom
3. Look for text blocks separate from numbered questions

If you find ANY reading passage, return ONLY the text of that passage.
If you find multiple passages, combine them.
If you find NO reading passages, return exactly: "NO_PASSAGE_FOUND"

DO NOT include questions, answer options, or instructions.
ONLY return the actual reading passage text.`,
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageUrl,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 3000,
                temperature: 0.1,
            }),
        });

        if (!res.ok) {
            throw new Error(`OpenAI API error: ${res.statusText}`);
        }

        const data = await res.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const content = data.choices[0].message.content.trim();
            
            if (content === "NO_PASSAGE_FOUND" || content.length < 20) {
                return '';
            }
            
            return content;
        }
        
        return '';
    } catch (error) {
        console.error("Secondary passage extraction failed:", error);
        return '';
    }
}

export interface ParsedQuestion {
    questionText: string;
    options: QuestionOption;
    correctAnswer: keyof QuestionOption;
    explanation: string;
    passage?: string; // Reading passage for the question(s)
    imagePrompt?: string; // Description of images needed for the question
}

export interface QuestionParseResult {
    questions: ParsedQuestion[];
}

export interface OpenAIVisionResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
    error?: {
        message: string;
        type: string;
    };
}

export async function parseImageToQuestions(imageUrl: string): Promise<QuestionParseResult> {
    try {
        // Validate OpenAI API key
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OpenAI API key is not configured");
        }

        // Validate image URL
        if (!imageUrl || !imageUrl.startsWith('http')) {
            throw new Error("Invalid image URL provided");
        }

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o", // Updated to latest vision model
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `You are an expert at analyzing educational content and extracting questions with their context. Analyze this image VERY CAREFULLY and extract all content in the following JSON format:

{
  "questions": [
    {
      "questionText": "...",
      "options": {
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "...",
        "E": "..."
      },
      "correctAnswer": "...",
      "explanation": "...",
      "passage": "...",
      "imagePrompt": "..."
    }
  ]
}

🔍 STEP-BY-STEP ANALYSIS PROCESS:

STEP 1 - SCAN FOR READING PASSAGES (MOST CRITICAL):
Before extracting questions, THOROUGHLY scan the ENTIRE image for ANY text that could be reading material:
- Look at the TOP of the page first - passages often appear here
- Look for paragraphs, stories, dialogues, articles, or any continuous text
- Look for text in boxes, indented sections, or highlighted areas
- Look for ANY text that is NOT part of question stems or answer choices
- This includes: narratives, conversations, news articles, scientific explanations, historical accounts, poems, or any contextual text
- Even 2-3 sentences can be a reading passage - DON'T IGNORE SHORT TEXTS
- Text passages may appear in Indonesian, English, or other languages

STEP 2 - EXTRACT QUESTIONS:
- Find all numbered questions (1, 2, 3, etc.)
- Include complete question text
- Extract all answer options (A, B, C, D, E if present)
- Determine correct answers if possible

CRITICAL RULES FOR "passage" FIELD:
✅ ALWAYS look for text passages that questions might reference
✅ If you see phrases like "berdasarkan teks", "menurut bacaan", "dari cerita", "according to the text" in questions - there MUST be a passage somewhere
✅ Copy the ENTIRE passage text exactly as written
✅ If multiple questions refer to the same passage, give ALL those questions the SAME passage text
✅ Include short passages too - even 1-2 paragraphs count
✅ Look for dialogue formats like: "A: Hello" "B: Hi" - this is also passage
❌ Only use empty string "" if you are 100% certain NO reading material exists

FOR "imagePrompt" FIELD:
- Describe any diagrams, charts, maps, or illustrations that would help answer the question
- Examples: "Diagram of plant cell structure", "Graph showing temperature changes", "Map of Southeast Asia"
- Use "" if no visual aid is needed

🚨 QUALITY CHECK:
- If ANY question contains words like "teks di atas", "bacaan", "cerita", "according to", "based on" - you MUST find the related passage
- Re-scan the image if questions seem to reference text you haven't found
- Be extra careful with Indonesian exam materials - they often have reading passages

Output ONLY valid JSON, no other text.`,
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageUrl,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 6000, // Increased to handle longer reading passages
                temperature: 0.1,  // Keep low for consistent parsing
                top_p: 0.9, // Add top_p for better text recognition
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(`OpenAI API error: ${errorData.error?.message || res.statusText}`);
        }

        const data: OpenAIVisionResponse = await res.json();

        if (data.error) {
            throw new Error(`OpenAI API error: ${data.error.message}`);
        }

        if (!data.choices || data.choices.length === 0) {
            throw new Error("No response from OpenAI API");
        }

        const content = data.choices[0].message.content.trim();

        // Try to extract JSON from the response (sometimes GPT adds extra text)
        let jsonContent = content;
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
            jsonContent = content.substring(jsonStart, jsonEnd + 1);
        }

        try {
            const parsed: QuestionParseResult = JSON.parse(jsonContent);

            // Validate the parsed result structure
            if (!parsed.questions || !Array.isArray(parsed.questions)) {
                throw new Error("Invalid response structure: missing questions array");
            }

            // Validate each question
            parsed.questions.forEach((question, index) => {
                if (!question.questionText || !question.options) {
                    throw new Error(`Invalid question structure at index ${index}`);
                }

                // Ensure we have at least A, B, C, D options
                const requiredOptions = ['A', 'B', 'C', 'D'];
                for (const option of requiredOptions) {
                    if (!question.options[option as keyof QuestionOption]) {
                        question.options[option as keyof QuestionOption] = `Option ${option}`;
                    }
                }

                // Set default correct answer if missing
                if (!question.correctAnswer || !question.options[question.correctAnswer]) {
                    question.correctAnswer = 'A';
                }

                // Set default explanation if missing
                if (!question.explanation) {
                    question.explanation = 'Answer explanation not provided';
                }

                // Set default passage if missing
                if (question.passage === undefined) {
                    question.passage = '';
                }

                // Set default imagePrompt if missing
                if (question.imagePrompt === undefined) {
                    question.imagePrompt = '';
                }
            });

            // Enhanced post-processing to detect and validate reading passages
            if (parsed.questions.length > 0) {
                // First, try fallback extraction if questions suggest there should be passage but none found
                const questionsWithoutPassage = parsed.questions.filter(q => !q.passage || q.passage.trim() === '');
                const shouldHavePassageFlag = shouldHavePassage(parsed.questions);
                
                if (shouldHavePassageFlag && questionsWithoutPassage.length > 0) {
                    console.log(`🔍 Questions suggest there should be reading material. Attempting fallback extraction...`);
                    
                    // Try to extract passage from the raw AI response
                    const extractedPassage = extractPassageFromRawText(content);
                    
                    if (extractedPassage) {
                        console.log(`✅ Fallback extraction found passage: "${extractedPassage.substring(0, 100)}..."`);
                        
                        // Apply extracted passage to questions that don't have it
                        questionsWithoutPassage.forEach(q => {
                            if (shouldHavePassage([q])) { // Only apply to questions that specifically need it
                                q.passage = extractedPassage;
                            }
                        });
                    } else {
                        console.log(`❌ Fallback extraction failed. Trying secondary AI analysis...`);
                        
                        // Last resort: Use secondary AI analysis specifically for reading passages
                        const secondaryPassage = await extractPassageSecondary(imageUrl);
                        
                        if (secondaryPassage) {
                            console.log(`🎯 Secondary AI found passage: "${secondaryPassage.substring(0, 100)}..."`);
                            
                            // Apply to all questions that need passage
                            questionsWithoutPassage.forEach(q => {
                                if (shouldHavePassage([q])) {
                                    q.passage = secondaryPassage;
                                }
                            });
                        } else {
                            console.log(`❌ Secondary AI analysis also failed to find passage`);
                        }
                    }
                }
                
                // Define comprehensive patterns that indicate a question references reading material
                const textReferencePatterns = [
                    // Indonesian patterns
                    'berdasarkan teks',
                    'menurut bacaan',
                    'menurut passage',
                    'dari teks',
                    'sesuai teks',
                    'teks di atas',
                    'bacaan di atas',
                    'passage di atas',
                    'dalam teks',
                    'pada teks',
                    'dari cerita',
                    'dalam cerita',
                    'pada bacaan',
                    'pada passage',
                    'berdasarkan cerita',
                    'menurut cerita',
                    'tokoh dalam',
                    'karakter dalam',
                    'pesan dalam teks',
                    'isi teks',
                    'makna teks',
                    
                    // English patterns
                    'according to the text',
                    'based on the passage',
                    'in the text',
                    'from the text',
                    'the passage states',
                    'according to the passage',
                    'in the story',
                    'from the story',
                    'the author',
                    'the narrator',
                    'the character',
                    'main character',
                    'the story tells',
                    'based on the reading'
                ];

                // Re-check after fallback processing
                const finalQuestionsWithoutPassage = parsed.questions.filter(q => !q.passage || q.passage.trim() === '');
                const finalQuestionsWithPassage = parsed.questions.filter(q => q.passage && q.passage.trim() !== '');
                
                // Check if any question strongly suggests there should be reading material
                const referencingQuestions = finalQuestionsWithoutPassage.filter(q => {
                    const questionLower = q.questionText.toLowerCase();
                    return textReferencePatterns.some(pattern => questionLower.includes(pattern.toLowerCase()));
                });

                // If we found questions that reference text but have no passage, log detailed warning
                if (referencingQuestions.length > 0) {
                    console.log(`🚨 CRITICAL: Found ${referencingQuestions.length} questions that clearly reference reading material, but no passage was extracted!`);
                    console.log('Questions that need passage:');
                    referencingQuestions.forEach((q, i) => {
                        console.log(`${i + 1}. "${q.questionText.substring(0, 150)}..."`);
                        
                        // Find which pattern matched
                        const matchedPattern = textReferencePatterns.find(pattern => 
                            q.questionText.toLowerCase().includes(pattern.toLowerCase())
                        );
                        console.log(`   → Matched pattern: "${matchedPattern}"`);
                    });
                    
                    // If some questions have passage but others don't, try to share the passage
                    if (finalQuestionsWithPassage.length > 0 && finalQuestionsWithPassage[0].passage) {
                        const sharedPassage = finalQuestionsWithPassage[0].passage;
                        console.log(`ℹ️ Attempting to share passage from other questions: "${sharedPassage.substring(0, 100)}..."`);
                        
                        // Apply shared passage to questions that reference text but don't have passage
                        referencingQuestions.forEach(q => {
                            q.passage = sharedPassage;
                        });
                        
                        console.log(`✅ Applied shared passage to ${referencingQuestions.length} questions`);
                    }
                }

                // Additional check: look for questions that might need specific visual aids
                parsed.questions.forEach(q => {
                    if (!q.imagePrompt || q.imagePrompt.trim() === '') {
                        const questionLower = q.questionText.toLowerCase();
                        
                        // Check if question mentions visual elements
                        const visualPatterns = [
                            'diagram', 'grafik', 'tabel', 'peta', 'gambar', 'ilustrasi', 'bagan',
                            'chart', 'graph', 'map', 'figure', 'image', 'picture', 'illustration'
                        ];
                        
                        const needsVisual = visualPatterns.some(pattern => 
                            questionLower.includes(pattern) || 
                            q.options.A.toLowerCase().includes(pattern) ||
                            q.options.B.toLowerCase().includes(pattern) ||
                            q.options.C.toLowerCase().includes(pattern) ||
                            q.options.D.toLowerCase().includes(pattern)
                        );
                        
                        if (needsVisual) {
                            console.log(`📊 Question might benefit from visual aid: "${q.questionText.substring(0, 100)}..."`);
                        }
                    }
                });
                
                // Log final summary
                const finalQuestionsWithoutPassageCount = parsed.questions.filter(q => !q.passage || q.passage.trim() === '').length;
                const finalQuestionsWithPassageCount = parsed.questions.filter(q => q.passage && q.passage.trim() !== '').length;
                
                console.log(`📋 Final Processing Summary:`);
                console.log(`   - Total questions: ${parsed.questions.length}`);
                console.log(`   - Questions with passage: ${finalQuestionsWithPassageCount}`);
                console.log(`   - Questions without passage: ${finalQuestionsWithoutPassageCount}`);
                console.log(`   - Questions that should have passage: ${referencingQuestions.length}`);
                
                if (shouldHavePassageFlag && finalQuestionsWithPassageCount === 0) {
                    console.log(`⚠️ WARNING: Questions suggest reading material is needed but none was found!`);
                }
            }

            return parsed;
        } catch (parseError) {
            console.error("Failed to parse OpenAI response:", content);
            throw new Error(`Failed to parse JSON from GPT response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
        }
    } catch (error) {
        console.error("Error in parseImageToQuestions:", error);
        throw error;
    }
}
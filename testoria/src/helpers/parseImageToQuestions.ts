// Types for question parsing
export interface QuestionOption {
    A: string;
    B: string;
    C: string;
    D: string;
    E?: string; // Optional 5th option
}

export interface ParsedQuestion {
    questionText: string;
    options: QuestionOption;
    correctAnswer: keyof QuestionOption;
    explanation: string;
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
                                text: `This is an image of a multiple-choice exam. Please extract the questions into the following JSON format:

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
      "explanation": "..."
    }
  ]
}

Important rules:
1. Extract ALL visible questions from the image
2. Include ALL answer options (A, B, C, D, and E if present)
3. Determine the correct answer based on context if possible, otherwise use "A"
4. Provide brief explanations for each answer
5. Only output valid JSON, no extra text
6. If no questions are found, return {"questions": []}`,
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
                max_tokens: 4000, // Increased for better coverage
                temperature: 0.1,  // Lower temperature for more consistent parsing
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
            });

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
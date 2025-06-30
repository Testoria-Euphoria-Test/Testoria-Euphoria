export type QuestionType = {
    _id?: string;
    packageId: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    optionE: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
    explanation: string;
    images: string[];
    passage?: string; // Reading passage for the question(s)
    imagePrompt?: string; // Description of images needed for the question
    createdAt?: string;
    updatedAt?: string;
};
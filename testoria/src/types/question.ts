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
    createdAt?: string;
    updatedAt?: string;
};
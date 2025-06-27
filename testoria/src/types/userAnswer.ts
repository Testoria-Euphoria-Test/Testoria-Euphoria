export type UserAnswerType = {
    _id?: string;
    userId: string;
    packageId: string;
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    createdAt?: string;
};
export type ResultType = {
    _id?: string;
    userId: string;
    packageId: string;
    score: number;
    totalCorrect: number;
    totalWrong: number;
    totalUnanswered: number;
    durationTaken: number;
    feedback: string;
    createdAt?: string;
};
import { ObjectId } from "mongodb";
import { database } from "@/db/config/mongodb";
import { UserAnswerType } from "@/types/userAnswer";

class UserAnswerModel {
    static collection() {
        return database.collection("userAnswers");
    }

    static async submitMany(answers: UserAnswerType[]) {
        const now = new Date().toISOString();
        const prepared = answers.map((a) => {
            const doc: any = {
                userId: new ObjectId(a.userId),
                packageId: new ObjectId(a.packageId),
                questionId: new ObjectId(a.questionId),
                selectedAnswer: a.selectedAnswer,
                isCorrect: a.isCorrect,
                createdAt: now,
            };
            // Only include _id if it exists and is valid
            if (a._id) {
                doc._id = new ObjectId(a._id);
            }
            return doc;
        });
        const result = await this.collection().insertMany(prepared);
        return result;
    }

    static async findByUserAndPackage(userId: string, packageId: string) {
        return this.collection()
            .find({
                userId: new ObjectId(userId),
                packageId: new ObjectId(packageId),
            })
            .toArray();
    }

    static async findById(id: string) {
        const result = await this.collection().findOne({ _id: new ObjectId(id) });
        return result;
    }

    static async deleteByUserAndPackage(userId: string, packageId: string) {
        const result = await this.collection().deleteMany({
            userId: new ObjectId(userId),
            packageId: new ObjectId(packageId),
        });
        return result;
    }

    static async getScoreByUserAndPackage(userId: string, packageId: string) {
        const answers = await this.findByUserAndPackage(userId, packageId);
        const totalQuestions = answers.length;
        const correctAnswers = answers.filter(a => a.isCorrect).length;
        const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        
        return {
            totalQuestions,
            correctAnswers,
            incorrectAnswers: totalQuestions - correctAnswers,
            score: Math.round(score * 100) / 100, // Round to 2 decimal places
            percentage: `${Math.round(score)}%`
        };
    }
}

export default UserAnswerModel;
import { database } from '../config/mongodb';
import { ObjectId } from 'mongodb';
import { QuestionType } from '@/types/question';

class QuestionModel {
    static collection() {
        return database.collection('questions');
    }

    static async create(question: Omit<QuestionType, '_id'>) {
        const toInsert = {
            packageId: new ObjectId(question.packageId),
            questionText: question.questionText,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
            optionE: question.optionE,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            images: question.images || [],
            passage: question.passage || '',
            imagePrompt: question.imagePrompt || '',
            createdAt: new Date().toISOString()
        };
        const result = await this.collection().insertOne(toInsert);
        return result.insertedId;
    }

    static async findByPackageId(packageId: string) {
        return this.collection()
            .find({ packageId: new ObjectId(packageId) })
            .toArray();
    }

    static async deleteById(id: string) {
        const result = await this.collection().deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    static async findById(id: string) {
        return this.collection().findOne({ _id: new ObjectId(id) });
    }

    static async updateById(id: string, updateData: Partial<QuestionType>) {
        const toUpdate = { ...updateData };
        if (toUpdate.packageId) {
            toUpdate.packageId = new ObjectId(toUpdate.packageId) as any;
        }
        delete toUpdate._id; // Remove _id from update data

        const result = await this.collection().updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...toUpdate,
                    updatedAt: new Date().toISOString()
                }
            }
        );
        return result.modifiedCount > 0;
    }

    static async countByPackageId(packageId: string) {
        return this.collection().countDocuments({ packageId: new ObjectId(packageId) });
    }
}

export default QuestionModel;
import { ObjectId } from "mongodb";
import { database } from "@/db/config/mongodb";
import { ResultType } from "@/types/result";

class ResultModel {
    static collection() {
        return database.collection("results");
    }

    static async create(data: ResultType) {
        const doc: any = {
            userId: new ObjectId(data.userId),
            packageId: new ObjectId(data.packageId),
            score: data.score,
            totalCorrect: data.totalCorrect,
            totalWrong: data.totalWrong,
            totalUnanswered: data.totalUnanswered,
            durationTaken: data.durationTaken,
            feedback: data.feedback,
            createdAt: new Date().toISOString(),
        };
        
        // Only include _id if it exists and is valid
        if (data._id) {
            doc._id = new ObjectId(data._id);
        }
        
        const result = await this.collection().insertOne(doc);
        return { ...doc, _id: result.insertedId.toString() };
    }

    static async findByUser(userId: string) {
        return this.collection()
            .find({ userId: new ObjectId(userId) })
            .sort({ createdAt: -1 })
            .toArray();
    }

    static async findByUserAndPackage(userId: string, packageId: string) {
        return this.collection()
            .findOne({ 
                userId: new ObjectId(userId),
                packageId: new ObjectId(packageId)
            });
    }

    static async findById(id: string) {
        return this.collection().findOne({ _id: new ObjectId(id) });
    }

    static async deleteById(id: string) {
        return this.collection().deleteOne({ _id: new ObjectId(id) });
    }
}

export default ResultModel;
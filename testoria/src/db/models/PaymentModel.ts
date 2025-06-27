import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";
import { PaymentType, PaymentStatus } from "@/types/payment";

class PaymentModel {
    static collection() {
        return database.collection("payments");
    }

    static async create(data: Omit<PaymentType, '_id'>) {
        const payment = {
            userId: new ObjectId(data.userId),
            packageId: new ObjectId(data.packageId),
            amount: data.amount,
            status: data.status as PaymentType['status'],
            paymentDate: data.paymentDate,
            createdAt: new Date().toISOString(),
        };
        const result = await this.collection().insertOne(payment);
        return result.insertedId;
    }

    static async updateStatus(orderId: string, status: PaymentStatus, paymentDate: string) {
        const result = await this.collection().updateOne(
            { _id: new ObjectId(orderId) },
            { 
                $set: { 
                    status, 
                    paymentDate,
                    updatedAt: new Date().toISOString()
                } 
            }
        );
        return result.modifiedCount > 0;
    }

    static async getByUserId(userId: string) {
        return this.collection().find({ userId: new ObjectId(userId) }).toArray();
    }

    static async getById(paymentId: string) {
        return this.collection().findOne({ _id: new ObjectId(paymentId) });
    }

    static async getByPackageId(packageId: string) {
        return this.collection().find({ packageId: new ObjectId(packageId) }).toArray();
    }

    static async getByStatus(status: PaymentStatus) {
        return this.collection().find({ status }).toArray();
    }
}

export default PaymentModel;
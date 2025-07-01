import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";
import { PaymentType, PaymentStatus } from "@/types/payment";

class PaymentModel {
  static collection() {
    return database.collection("payments");
  }

  static async create(
    data: Omit<PaymentType, "_id"> & { midtransOrderId: string }
  ) {
    const payment = {
      userId: new ObjectId(data.userId),
      packageId: new ObjectId(data.packageId),
      amount: data.amount,
      status: "pending" as PaymentStatus, // Start with pending status
      paymentDate: undefined, // Will be set when payment is successful
      midtransOrderId: data.midtransOrderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const result = await this.collection().insertOne(payment);
    return result.insertedId;
  }

  static async updateStatus(
    orderId: string,
    status: PaymentStatus,
    paymentDate?: string
  ) {
    const updateData: {
      status: PaymentStatus;
      updatedAt: string;
      paymentDate?: string;
    } = {
      status,
      updatedAt: new Date().toISOString(),
    };

    // Set paymentDate only when payment is successful
    if (status === "paid" && paymentDate) {
      updateData.paymentDate = paymentDate;
    } else if (status === "paid" && !paymentDate) {
      // Fallback to current time if not provided
      updateData.paymentDate = new Date().toISOString();
    }

    const result = await this.collection().updateOne(
      { midtransOrderId: orderId },
      { $set: updateData }
    );

    return result.modifiedCount > 0;
  }

  static async getByUserId(userId: string) {
    const payments = await this.collection()
      .aggregate([
        {
          $match: { userId: new ObjectId(userId) },
        },
        {
          $lookup: {
            from: "packages",
            localField: "packageId",
            foreignField: "_id",
            as: "package",
          },
        },
        {
          $unwind: {
            path: "$package",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    return payments;
  }

  static async getById(paymentId: string) {
    return this.collection().findOne({ _id: new ObjectId(paymentId) });
  }

  static async getByPackageId(packageId: string) {
    return this.collection()
      .find({ packageId: new ObjectId(packageId) })
      .toArray();
  }

  static async getByStatus(status: PaymentStatus) {
    return this.collection().find({ status }).toArray();
  }

  static async findPaidPayment(userId: string, packageId: string) {
    const payment = await this.collection().findOne({
      userId: new ObjectId(userId),
      packageId: new ObjectId(packageId),
      status: "paid",
    });

    return payment;
  }

  static async findByMidtransOrderId(midtransOrderId: string) {
    return this.collection().findOne({ midtransOrderId });
  }
}

export default PaymentModel;

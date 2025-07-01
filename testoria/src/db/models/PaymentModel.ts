import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";
import { PaymentType, PaymentStatus } from "@/types/payment";
import UserModel from "./UserModel";
import PackageModel from "./PackageModel";

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

    // Add balance to creator when payment is successful
    try {
      await this.addBalanceToCreator(data.packageId, data.amount);
    } catch (error) {
      console.error("Failed to add balance to creator:", error);
      // Don't fail the payment, just log the error
    }

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

    // Add balance to creator when payment status changes to "paid"
    if (status === "paid" && result.modifiedCount > 0) {
      try {
        // Find the payment to get package and amount info
        const payment = await this.collection().findOne({ midtransOrderId: orderId });
        if (payment) {
          await this.addBalanceToCreator(payment.packageId.toString(), payment.amount);
        }
      } catch (error) {
        console.error("Failed to add balance to creator on status update:", error);
        // Don't fail the status update, just log the error
      }
    }

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

  // Helper method to add balance to creator when their package is purchased
  static async addBalanceToCreator(packageId: string, amount: number) {
    try {
      // Get the package to find the creator
      const packageData = await PackageModel.findById(packageId);
      
      if (!packageData) {
        throw new Error("Package not found");
      }

      // Calculate revenue split: 70% to creator, 30% to admin
      const creatorShare = Math.round(amount * 0.7); // 70% to creator
      const adminShare = amount - creatorShare; // 30% to admin (ensures total equals original amount)

      // Add the creator's share to their balance
      await UserModel.addBalance(packageData.creatorId.toString(), creatorShare);
      
      // Add admin share to admin revenue tracking
      await this.addAdminRevenue(packageId, adminShare, amount);
      
      console.log(`Revenue split for package ${packageId}: Creator gets ${creatorShare}, Admin gets ${adminShare} (Total: ${amount})`);
    } catch (error) {
      console.error("Error adding balance to creator:", error);
      throw error;
    }
  }

  // Helper method to track admin revenue
  static async addAdminRevenue(packageId: string, adminShare: number, totalAmount: number) {
    try {
      const adminRevenue = {
        packageId: new ObjectId(packageId),
        adminShare: adminShare,
        totalAmount: totalAmount,
        percentage: 30, // Admin gets 30%
        createdAt: new Date().toISOString(),
      };

      await database.collection("admin_revenue").insertOne(adminRevenue);
      console.log(`Added ${adminShare} to admin revenue for package ${packageId}`);
    } catch (error) {
      console.error("Error tracking admin revenue:", error);
      throw error;
    }
  }

  // Get admin revenue statistics
  static async getAdminRevenue(filters?: { startDate?: string; endDate?: string }) {
    try {
      const matchConditions: any = {};

      // Add date filters if provided
      if (filters?.startDate || filters?.endDate) {
        matchConditions.createdAt = {};
        if (filters.startDate) {
          matchConditions.createdAt.$gte = filters.startDate;
        }
        if (filters.endDate) {
          matchConditions.createdAt.$lte = filters.endDate;
        }
      }

      const pipeline = [
        { $match: matchConditions },
        {
          $lookup: {
            from: "packages",
            localField: "packageId",
            foreignField: "_id",
            as: "package"
          }
        },
        {
          $unwind: "$package"
        },
        {
          $lookup: {
            from: "users",
            localField: "package.creatorId",
            foreignField: "_id",
            as: "creator"
          }
        },
        {
          $unwind: "$creator"
        },
        {
          $group: {
            _id: null,
            totalAdminRevenue: { $sum: "$adminShare" },
            totalTransactions: { $sum: 1 },
            totalGrossRevenue: { $sum: "$totalAmount" },
            packageBreakdown: {
              $push: {
                packageId: "$packageId",
                packageTitle: "$package.title",
                creatorName: "$creator.name",
                adminShare: "$adminShare",
                totalAmount: "$totalAmount",
                date: "$createdAt"
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalAdminRevenue: 1,
            totalTransactions: 1,
            totalGrossRevenue: 1,
            averageRevenuePerTransaction: {
              $cond: {
                if: { $gt: ["$totalTransactions", 0] },
                then: { $divide: ["$totalAdminRevenue", "$totalTransactions"] },
                else: 0
              }
            },
            packageBreakdown: 1
          }
        }
      ];

      const result = await database.collection("admin_revenue").aggregate(pipeline).toArray();
      
      if (result.length === 0) {
        return {
          totalAdminRevenue: 0,
          totalTransactions: 0,
          totalGrossRevenue: 0,
          averageRevenuePerTransaction: 0,
          packageBreakdown: []
        };
      }

      return result[0];
    } catch (error) {
      console.error("Error fetching admin revenue:", error);
      throw error;
    }
  }

  static async findByMidtransOrderId(midtransOrderId: string) {
    return this.collection().findOne({ midtransOrderId });
  }
}

export default PaymentModel;

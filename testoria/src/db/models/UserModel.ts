import { z } from "zod/v4";
import { database } from "../config/mongodb";
import { hashPassword } from "@/helpers/bcryptjs";
import { UserType } from "@/types/user";
import { ObjectId } from "mongodb";

const UserSchema = z.object({
    name: z.string().min(4, "Name must be at least 4 characters long"),
    email: z.email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(['admin', 'customer', 'creator']).default('customer'),
});

class UserModel {
    static collection() {
        return database.collection("users");
    }
    static async create(newUser: UserType) {
        // Basic validation first
        UserSchema.parse(newUser);

        // Manual uniqueness checks
        const existingEmail = await this.collection().findOne({ email: newUser.email });
        if (existingEmail) {
            throw { message: "Email already exists", status: 400 };
        }

        // Prepare user document for insertion
        const userToInsert = {
            name: newUser.name,
            email: newUser.email,
            password: await hashPassword(newUser.password),
            role: newUser.role || 'customer',
            balance: newUser.role === 'creator' ? 0 : undefined, // Initialize balance for creators
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await this.collection().insertOne(userToInsert);
        return { message: "User created successfully" };
    }

    static async findByEmail(email: string) {
        const user = await this.collection().findOne({ email });
        return user;
    }

    static async getAllUsers() {
        const users = await this.collection().find({}).toArray();
        return users;
    }

    static async deleteUserById(userId: string) {
        if (!ObjectId.isValid(userId)) {
            throw { message: "Invalid user ID", status: 400 };
        }

        const result = await this.collection().deleteOne({ _id: new ObjectId(userId) });
        
        if (result.deletedCount === 0) {
            throw { message: "User not found", status: 404 };
        }

        return { message: "User deleted successfully" };
    }

    static async findById(userId: string) {
        if (!ObjectId.isValid(userId)) {
            throw { message: "Invalid user ID", status: 400 };
        }

        const user = await this.collection().findOne({ _id: new ObjectId(userId) });
        
        if (!user) {
            throw { message: "User not found", status: 404 };
        }

        return user;
    }

    // Balance management methods for creators
    static async addBalance(userId: string, amount: number) {
        if (!ObjectId.isValid(userId)) {
            throw { message: "Invalid user ID", status: 400 };
        }

        if (amount <= 0) {
            throw { message: "Amount must be positive", status: 400 };
        }

        // Check if user is a creator
        const user = await this.findById(userId);
        if (user.role !== 'creator') {
            throw { message: "Only creators can have balance", status: 400 };
        }

        const result = await this.collection().updateOne(
            { _id: new ObjectId(userId) },
            { 
                $inc: { balance: amount },
                $set: { updatedAt: new Date().toISOString() }
            }
        );

        if (result.modifiedCount === 0) {
            throw { message: "Failed to update balance", status: 500 };
        }

        return { message: "Balance updated successfully", amount };
    }

    static async getBalance(userId: string) {
        if (!ObjectId.isValid(userId)) {
            throw { message: "Invalid user ID", status: 400 };
        }

        const user = await this.findById(userId);
        
        if (user.role !== 'creator') {
            throw { message: "Only creators have balance", status: 400 };
        }

        return user.balance || 0;
    }

    static async initializeCreatorBalance(userId: string) {
        if (!ObjectId.isValid(userId)) {
            throw { message: "Invalid user ID", status: 400 };
        }

        const result = await this.collection().updateOne(
            { _id: new ObjectId(userId), role: 'creator', balance: { $exists: false } },
            { 
                $set: { 
                    balance: 0,
                    updatedAt: new Date().toISOString()
                }
            }
        );

        return result.modifiedCount > 0;
    }
}

export default UserModel;
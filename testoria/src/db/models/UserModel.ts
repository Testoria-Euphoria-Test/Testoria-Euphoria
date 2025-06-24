import { z } from "zod/v4";
import { database } from "../config/mongodb";
import { hashPassword } from "@/helpers/bcryptjs";
import { UserType } from "@/types/user";

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
}

export default UserModel;
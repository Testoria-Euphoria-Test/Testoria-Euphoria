import UserModel from "@/db/models/UserModel";
import { comparePassword } from "@/helpers/bcryptjs";
import errorHandler from "@/helpers/errorHandler";
import { signToken } from "@/helpers/jwt";
import { z } from "zod/v4";
import { cookies } from "next/headers";

// Login validation schema
const LoginSchema = z.object({
    email: z.email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Validate input
        LoginSchema.parse({ email, password });

        // Find user by email
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw { message: "Invalid email or password", status: 401 };
        }

        // Compare password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw { message: "Invalid email or password", status: 401 };
        }

        const token = signToken({
            _id: user._id.toString(),
            email: user.email
        });

        const cookieStore = await cookies();
        
        // Set Authorization cookie with proper options
        cookieStore.set("Authorization", `Bearer ${token}`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });
        
        // Set additional user info cookies
        cookieStore.set("x-user-id", user._id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });
        
        cookieStore.set("x-user-role", user.role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });

        // Set non-httpOnly cookie for client-side access to user role
        cookieStore.set("user-role", user.role, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });

        return Response.json({
            message: "Login successful",
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                name: user.name
            }
        });

    } catch (error) {
        return errorHandler(error);
    }
}
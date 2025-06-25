import ProfileModel from "@/db/models/ProfileModel";
import { ProfileInput } from "@/types/profle";
import errorHandler from "@/helpers/errorHandler";

export async function GET(request: Request) {
    try {
        // Get user info from middleware headers (requires auth)
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            throw { message: "Unauthorized - Authentication required", status: 401 };
        }

        // Find profile by user ID
        const profile = await ProfileModel.findByUserId(userId);

        if (!profile) {
            throw { message: "Profile not found", status: 404 };
        }

        return Response.json({
            success: true,
            message: "Profile retrieved successfully",
            data: profile
        });

    } catch (error) {
        return errorHandler(error);
    }
}

export async function PUT(request: Request) {
    try {
        // Get user info from middleware headers (requires auth)
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            throw { message: "Unauthorized - Authentication required", status: 401 };
        }

        const body: ProfileInput = await request.json();

        // Update profile by user ID
        const result = await ProfileModel.updateByUserId(userId, body);

        return Response.json(result);

    } catch (error) {
        return errorHandler(error);
    }
}

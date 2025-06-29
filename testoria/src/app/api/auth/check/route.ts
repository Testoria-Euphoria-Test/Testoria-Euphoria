import errorHandler from "@/helpers/errorHandler";
import UserModel from "@/db/models/UserModel";

export async function GET(request: Request) {
    try {
        // Get user info from middleware headers (requires auth)
        const userId = request.headers.get('x-user-id');
        const userEmail = request.headers.get('x-user-email');

        if (!userId) {
            throw { message: "Unauthorized - Authentication required", status: 401 };
        }

        // Get user details including role
        const user = await UserModel.findById(userId);

        return Response.json({
            success: true,
            message: "User is authenticated",
            data: {
                userId,
                userEmail,
                userRole: user.role
            }
        });

    } catch (error) {
        return errorHandler(error);
    }
}

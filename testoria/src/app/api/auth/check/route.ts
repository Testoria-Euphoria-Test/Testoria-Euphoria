import errorHandler from "@/helpers/errorHandler";
import UserModel from "@/db/models/UserModel";

export async function GET(request: Request) {
    try {
        // Get user info from middleware headers (requires auth)
        const userId = request.headers.get('x-user-id');
        const userEmail = request.headers.get('x-user-email');
        const userRole = request.headers.get('x-user-role');

        if (!userId) {
            throw { message: "Unauthorized - Authentication required", status: 401 };
        }

        // If we have the role from middleware, use it; otherwise fetch from DB as fallback
        let role = userRole;
        if (!role) {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw { message: "User not found", status: 401 };
            }
            role = user.role;
        }

        return Response.json({
            success: true,
            message: "User is authenticated",
            data: {
                userId,
                userEmail,
                userRole: role
            }
        });

    } catch (error) {
        return errorHandler(error);
    }
}

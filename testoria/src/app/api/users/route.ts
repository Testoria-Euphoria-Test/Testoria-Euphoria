import UserModel from "@/db/models/UserModel";
import errorHandler from "@/helpers/errorHandler";

export async function GET(request: Request) {
    try {
        // Get user info from middleware headers
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            throw { message: "User information not found", status: 401 };
        }

        // Check if user is admin
        const currentUser = await UserModel.findById(userId);
        if (currentUser.role !== 'admin') {
            throw { message: "Forbidden - Admin access required", status: 403 };
        }

        // Get all users
        const users = await UserModel.getAllUsers();

        // Remove password field from response for security
        const safeUsers = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        return Response.json({
            message: "Users retrieved successfully",
            data: safeUsers
        });

    } catch (error) {
        return errorHandler(error);
    }
}

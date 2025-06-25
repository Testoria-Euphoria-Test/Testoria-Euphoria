import UserModel from "@/db/models/UserModel";
import errorHandler from "@/helpers/errorHandler";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get user info from middleware headers
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            throw { message: "User information not found", status: 401 };
        }

        // Check if user is admin or requesting their own data
        const currentUser = await UserModel.findById(userId);
        if (currentUser.role !== 'admin' && userId !== id) {
            throw { message: "Forbidden - Can only access your own data", status: 403 };
        }

        // Get user by ID
        const user = await UserModel.findById(id);

        // Remove password field from response for security
        const { password, ...userWithoutPassword } = user;

        return Response.json({
            message: "User retrieved successfully",
            data: userWithoutPassword
        });

    } catch (error) {
        return errorHandler(error);
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

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

        // Prevent admin from deleting themselves
        if (userId === id) {
            throw { message: "Cannot delete your own account", status: 400 };
        }

        // Delete user
        const result = await UserModel.deleteUserById(id);

        return Response.json(result);

    } catch (error) {
        return errorHandler(error);
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Get user info from middleware headers
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            throw { message: "User information not found", status: 401 };
        }

        // Check if user is admin or updating their own data
        const currentUser = await UserModel.findById(userId);
        if (currentUser.role !== 'admin' && userId !== id) {
            throw { message: "Forbidden - Can only update your own data", status: 403 };
        }

        // Find the user to update
        const userToUpdate = await UserModel.findById(id);

        // Prepare update data (exclude password and sensitive fields for now)
        const allowedUpdates = ['name', 'email'];
        const updateData: any = {};

        for (const field of allowedUpdates) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        // Only admin can update role
        if (body.role && currentUser.role === 'admin') {
            updateData.role = body.role;
        }

        // Add updatedAt timestamp
        updateData.updatedAt = new Date().toISOString();

        // Update user
        await UserModel.collection().updateOne(
            { _id: userToUpdate._id },
            { $set: updateData }
        );

        return Response.json({
            message: "User updated successfully"
        });

    } catch (error) {
        return errorHandler(error);
    }
}

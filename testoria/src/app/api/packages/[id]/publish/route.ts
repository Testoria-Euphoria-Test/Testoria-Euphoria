import PackageModel from "@/db/models/PackageModel";
import UserModel from "@/db/models/UserModel";
import errorHandler from "@/helpers/errorHandler";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get user info from middleware headers (requires auth)
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            throw { message: "Unauthorized - Authentication required", status: 401 };
        }

        // Get the package to check ownership
        const existingPackage = await PackageModel.findById(id);

        // Check if user is the creator or admin
        const currentUser = await UserModel.findById(userId);
        const isOwner = existingPackage.creatorId.toString() === userId;
        const isAdmin = currentUser.role === 'admin';

        if (!isOwner && !isAdmin) {
            throw { message: "Forbidden - You can only publish your own packages", status: 403 };
        }

        const { isPublished } = await request.json();

        if (typeof isPublished !== 'boolean') {
            throw { message: "isPublished must be a boolean value", status: 400 };
        }

        // Toggle publish status
        const result = await PackageModel.togglePublishStatus(id, isPublished);

        return Response.json(result);

    } catch (error) {
        return errorHandler(error);
    }
}

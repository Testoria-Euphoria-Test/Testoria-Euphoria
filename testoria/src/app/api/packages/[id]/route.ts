import PackageModel from "@/db/models/PackageModel";
import UserModel from "@/db/models/UserModel";
import errorHandler from "@/helpers/errorHandler";
import { PackageUpdateType } from "@/types/package";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const url = new URL(request.url);
        const withDetails = url.searchParams.get('withDetails') === 'true';

        let packageData;

        if (withDetails) {
            // Get package with populated category and creator info
            packageData = await PackageModel.findByIdWithDetails(id);
        } else {
            // Get basic package info
            packageData = await PackageModel.findById(id);
        }

        return Response.json({
            success: true,
            message: "Package retrieved successfully",
            data: packageData
        });

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
            throw { message: "Forbidden - You can only edit your own packages", status: 403 };
        }

        const body: PackageUpdateType = await request.json();

        // If user is not admin, remove isPublished from update data
        if (!isAdmin && 'isPublished' in body) {
            delete body.isPublished;
        }

        // Update package
        const result = await PackageModel.updateById(id, body);

        return Response.json(result);

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
            throw { message: "Forbidden - You can only delete your own packages", status: 403 };
        }

        // Delete package
        const result = await PackageModel.deleteById(id);

        return Response.json(result);

    } catch (error) {
        return errorHandler(error);
    }
}

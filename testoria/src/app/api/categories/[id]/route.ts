import CategoryModel from "@/db/models/CategoryModel";
import UserModel from "@/db/models/UserModel";
import errorHandler from "@/helpers/errorHandler";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get category by ID
        const category = await CategoryModel.findById(id);

        return Response.json({
            message: "Category retrieved successfully",
            data: category
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
        const body = await request.json();

        // Get user info from middleware headers (requires auth)
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            throw { message: "Unauthorized - Authentication required", status: 401 };
        }

        // Check if user is admin
        const currentUser = await UserModel.findById(userId);
        if (currentUser.role !== 'admin') {
            throw { message: "Forbidden - Admin access required", status: 403 };
        }

        // Update category
        const result = await CategoryModel.updateById(id, body);

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

        // Check if user is admin
        const currentUser = await UserModel.findById(userId);
        if (currentUser.role !== 'admin') {
            throw { message: "Forbidden - Admin access required", status: 403 };
        }

        // Delete category
        const result = await CategoryModel.deleteById(id);

        return Response.json(result);

    } catch (error) {
        return errorHandler(error);
    }
}

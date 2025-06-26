import PackageModel from "@/db/models/PackageModel";
import errorHandler from "@/helpers/errorHandler";

export async function GET(request: Request) {
    try {
        // Get user info from middleware headers (requires auth)
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            throw { message: "Unauthorized - Authentication required", status: 401 };
        }

        const url = new URL(request.url);
        const publishedOnly = url.searchParams.get('publishedOnly') === 'true';

        // Get creator's packages
        const packages = await PackageModel.findByCreatorIdAll(userId, publishedOnly);

        return Response.json({
            success: true,
            message: `${publishedOnly ? 'Published packages' : 'All packages'} retrieved successfully`,
            data: packages
        });

    } catch (error) {
        return errorHandler(error);
    }
}

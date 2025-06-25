import ProfileModel from "@/db/models/ProfileModel";
import { ProfileInput } from "@/types/profle";
import errorHandler from "@/helpers/errorHandler";

export async function POST(request: Request) {
    try {
        // Get user info from middleware headers (requires auth)
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            throw { message: "Unauthorized - Authentication required", status: 401 };
        }

        const body: ProfileInput = await request.json();

        // Create profile for the authenticated user
        const result = await ProfileModel.create(userId, body);

        return Response.json(result, { status: 201 });

    } catch (error) {
        return errorHandler(error);
    }
}

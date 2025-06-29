import ProfileModel from "@/db/models/ProfileModel";
import errorHandler from "@/helpers/errorHandler";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        // Get profile by user ID with user information
        const profile = await ProfileModel.findByUserIdWithUser(userId);

        if (!profile) {
            throw { message: "Profile not found", status: 404 };
        }

        // Return profile data with consistent structure
        return Response.json({
            success: true,
            message: "Profile retrieved successfully",
            data: {
                id: profile._id,
                photoUrl: profile.photoUrl || "",
                education: profile.education,
                certificates: profile.certificates,
                bio: profile.bio,
                createdAt: profile.createdAt,
                user: {
                    id: profile.user._id,
                    name: profile.user.name,
                    email: profile.user.email,
                    role: profile.user.role,
                    createdAt: profile.user.createdAt
                }
            }
        });

    } catch (error) {
        return errorHandler(error);
    }
}

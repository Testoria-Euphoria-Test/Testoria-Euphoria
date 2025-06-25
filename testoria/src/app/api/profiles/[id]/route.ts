import ProfileModel from "@/db/models/ProfileModel";
import errorHandler from "@/helpers/errorHandler";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get profile by ID with user information
        const profile = await ProfileModel.getProfileWithUser(id);

        if (profile.user.role !== 'creator') {
            // For non-creators, only show basic profile info
            const basicProfile = {
                _id: profile._id,
                photoUrl: profile.photoUrl,
                education: profile.education,
                certificates: profile.certificates,
                bio: profile.bio
            };

            return Response.json({
                success: true,
                message: "Profile retrieved successfully",
                data: basicProfile
            });
        }

        // For creators, show full profile
        return Response.json({
            success: true,
            message: "Creator profile retrieved successfully",
            data: {
                _id: profile._id,
                photoUrl: profile.photoUrl,
                education: profile.education,
                certificates: profile.certificates,
                bio: profile.bio,
                createdAt: profile.createdAt,
                user: {
                    email: profile.user.email,
                    role: profile.user.role
                }
            }
        });

    } catch (error) {
        return errorHandler(error);
    }
}

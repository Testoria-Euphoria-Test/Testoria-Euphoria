import { NextRequest, NextResponse } from "next/server";
import PaymentModel from "@/db/models/PaymentModel";
import PackageModel from "@/db/models/PackageModel";
import { ObjectId } from "mongodb";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ packageId: string }> }
) {
    try {
        // Get user info from middleware headers (requires auth)
        const userId = request.headers.get('x-user-id');

        // Await params before accessing properties
        const { packageId } = await params;

        console.log('Customer API - User ID from header:', userId);
        console.log('Customer API - Package ID:', packageId);

        if (!userId) {
            console.log('Customer API - No user ID found');
            return NextResponse.json({ message: "Unauthorized - Authentication required" }, { status: 401 });
        }

        // Verify that the user is the creator of this package
        const packageData = await PackageModel.findById(packageId);
        console.log('Customer API - Package found:', !!packageData, packageData?.title);

        if (!packageData) {
            console.log('Customer API - Package not found');
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        console.log('Customer API - Package creator ID:', packageData.creatorId);
        console.log('Customer API - Current user ID:', userId);
        console.log('Customer API - Package creator ID type:', typeof packageData.creatorId);
        console.log('Customer API - User ID type:', typeof userId);

        // Convert both to strings for comparison
        const creatorIdString = packageData.creatorId.toString();
        const userIdString = userId.toString();

        console.log('Customer API - Creator ID (string):', creatorIdString);
        console.log('Customer API - User ID (string):', userIdString);
        console.log('Customer API - IDs match:', creatorIdString === userIdString);

        if (creatorIdString !== userIdString) {
            console.log('Customer API - Authorization failed - not the creator');
            return NextResponse.json({
                success: false,
                message: "Not authorized to view this package's customers"
            }, { status: 403 });
        }

        console.log('Customer API - Authorization successful');

        // Get all paid payments for this package with user details
        const customers = await PaymentModel.collection()
            .aggregate([
                {
                    $match: {
                        packageId: new ObjectId(packageId),
                        status: "paid"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: false,
                    },
                },
                {
                    $lookup: {
                        from: "profiles",
                        localField: "userId",
                        foreignField: "userId",
                        as: "profile",
                    },
                },
                {
                    $unwind: {
                        path: "$profile",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        _id: 1,
                        amount: 1,
                        paymentDate: 1,
                        createdAt: 1,
                        user: {
                            _id: "$user._id",
                            name: "$user.name",
                            email: "$user.email",
                        },
                        profile: {
                            _id: "$profile._id",
                            fullName: "$profile.fullName",
                            avatar: "$profile.avatar",
                            phone: "$profile.phone",
                        }
                    }
                },
                {
                    $sort: { paymentDate: -1 }
                }
            ])
            .toArray();

        console.log('Customer API - Found customers:', customers.length);

        return NextResponse.json({
            success: true,
            data: customers,
        });
    } catch (error) {
        console.error("Error fetching package customers:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

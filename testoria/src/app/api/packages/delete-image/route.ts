import { NextRequest, NextResponse } from 'next/server';
import { deleteFromCloudinary } from '@/helpers/cloudinary';

export async function DELETE(request: NextRequest) {
    try {
        const { imageUrl } = await request.json();

        if (!imageUrl) {
            return NextResponse.json(
                { success: false, message: 'No image URL provided' },
                { status: 400 }
            );
        }

        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/[cloud]/image/upload/v[version]/[folder]/[public_id].[extension]
        const matches = imageUrl.match(/\/testoria\/packages\/([^/.]+)/);
        if (matches && matches[1]) {
            const publicId = `testoria/packages/${matches[1]}`;

            try {
                await deleteFromCloudinary(publicId);
            } catch (cloudinaryError) {
                console.warn('Failed to delete from Cloudinary:', cloudinaryError);
                // Continue anyway since the main goal is to remove from database
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Image deleted successfully'
        });

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete image'
            },
            { status: 500 }
        );
    }
}

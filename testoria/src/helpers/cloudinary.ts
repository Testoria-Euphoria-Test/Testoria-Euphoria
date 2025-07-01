import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    url: string;
    format: string;
    resource_type: string;
    bytes: number;
}

export class CloudinaryHelper {
    /**
     * Upload image to Cloudinary
     * @param buffer - Image buffer
     * @param folder - Cloudinary folder name
     * @param publicId - Optional public ID
     * @returns Promise<CloudinaryUploadResult>
     */
    static async uploadImage(
        buffer: Buffer,
        folder: string,
        publicId?: string
    ): Promise<CloudinaryUploadResult> {
        return new Promise((resolve, reject) => {
            const uploadOptions: any = {
                folder,
                resource_type: 'image',
                quality: 'auto',
                fetch_format: 'auto',
            };

            if (publicId) {
                uploadOptions.public_id = publicId;
                uploadOptions.overwrite = true;
            }

            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(new Error(`Upload failed: ${error.message}`));
                    } else if (result) {
                        resolve(result as CloudinaryUploadResult);
                    } else {
                        reject(new Error('Upload failed: No result returned'));
                    }
                }
            ).end(buffer);
        });
    }

    /**
     * Delete image from Cloudinary
     * @param publicId - Public ID of the image to delete
     * @returns Promise<boolean>
     */
    static async deleteImage(publicId: string): Promise<boolean> {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result.result === 'ok';
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            return false;
        }
    }

    /**
     * Extract public ID from Cloudinary URL
     * @param url - Cloudinary URL
     * @returns string - Public ID
     */
    static extractPublicId(url: string): string {
        try {
            const parts = url.split('/');
            const filename = parts[parts.length - 1];
            const publicId = filename.split('.')[0];

            // Handle folders in public ID
            const folderIndex = url.indexOf('/v1_1/');
            if (folderIndex !== -1) {
                const pathAfterVersion = url.substring(url.indexOf('/', folderIndex + 5) + 1);
                const withoutExtension = pathAfterVersion.substring(0, pathAfterVersion.lastIndexOf('.'));
                return withoutExtension;
            }

            return publicId;
        } catch (error) {
            console.error('Error extracting public ID:', error);
            return '';
        }
    }

    /**
     * Upload profile photo
     * @param buffer - Image buffer
     * @param userId - User ID for folder organization
     * @returns Promise<CloudinaryUploadResult>
     */
    static async uploadProfilePhoto(buffer: Buffer, userId: string): Promise<CloudinaryUploadResult> {
        const publicId = `profile_${userId}_${Date.now()}`;
        return this.uploadImage(buffer, 'profiles/photos', publicId);
    }

    /**
     * Upload certificate
     * @param buffer - Image buffer
     * @param userId - User ID for folder organization
     * @returns Promise<CloudinaryUploadResult>
     */
    static async uploadCertificate(buffer: Buffer, userId: string): Promise<CloudinaryUploadResult> {
        const publicId = `cert_${userId}_${Date.now()}`;
        return this.uploadImage(buffer, 'profiles/certificates', publicId);
    }
}

export default CloudinaryHelper;

// Standalone export functions for easier importing
export const uploadToCloudinary = (buffer: Buffer, options?: { folder?: string; transformation?: any[] }) => {
    const folder = options?.folder || 'uploads';
    return CloudinaryHelper.uploadImage(buffer, folder);
};

export const deleteFromCloudinary = (publicId: string) => {
    return CloudinaryHelper.deleteImage(publicId);
};

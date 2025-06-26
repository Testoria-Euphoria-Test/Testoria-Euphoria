import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(fileBuffer: Buffer, fileName: string): Promise<string> {
    try {
        // Determine resource type based on file extension
        const fileExtension = fileName.toLowerCase().split('.').pop();
        const resourceType = fileExtension === 'pdf' ? 'raw' : 'auto';
        
        console.log(`Uploading ${fileName} as ${resourceType} resource type`);
        
        // Create a promise wrapper for the upload
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: resourceType, // Use 'raw' for PDFs, 'auto' for images
                    folder: "testoria/packages", // Organize files in folders
                    public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, "")}`, // Remove extension and add timestamp
                    access_mode: "public", // Ensure public access
                    secure: true, // Use HTTPS URLs
                    use_filename: true, // Preserve original filename
                    unique_filename: false, // Use our custom public_id
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(fileBuffer);
        });

        const result = uploadResult as any;
        console.log("✅ File uploaded to Cloudinary:", result.secure_url);
        return result.secure_url;
        
    } catch (error) {
        console.error("❌ Failed to upload to Cloudinary:", error);
        throw new Error(`Failed to upload file to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
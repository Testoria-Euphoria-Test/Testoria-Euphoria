import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(fileBuffer: Buffer, fileName: string): Promise<string> {
    try {
        // For PDFs, use 'image' resource type to get accessible URLs with .pdf extension
        // For other files, use 'auto' to let Cloudinary determine the type
        const fileExtension = fileName.toLowerCase().split('.').pop();
        const resourceType = fileExtension === 'pdf' ? 'image' : 'auto';
        
        console.log(`Uploading ${fileName} as ${resourceType} resource type`);
        
        // Create a promise wrapper for the upload
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: resourceType, // Use 'image' for PDFs to get accessible URLs
                    folder: "testoria/packages", // Organize files in folders
                    public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, "")}`, // Remove extension and add timestamp
                    access_mode: "public", // Ensure public access
                    secure: true, // Use HTTPS URLs
                    use_filename: true, // Preserve original filename
                    unique_filename: false, // Use our custom public_id
                    format: fileExtension === 'pdf' ? 'pdf' : undefined, // Ensure PDF extension is preserved
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
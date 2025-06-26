import { PDFDocument } from 'pdf-lib';
import { uploadToCloudinary } from "./uploadToCloudinary";

/**
 * Generate pdfImages URLs based on the uploaded PDF URL and page count
 * Format: /upload/pg_${index+1}/...jpg for each page
 */
export function generatePdfImageUrls(pdfUrl: string, pageCount: number): string[] {
    const imageUrls: string[] = [];
    
    // Extract the public_id from the Cloudinary URL
    // Example: https://res.cloudinary.com/your-cloud/image/upload/v1234/folder/filename.pdf
    // We want to transform this to: https://res.cloudinary.com/your-cloud/image/upload/pg_1/v1234/folder/filename.jpg
    
    try {
        const urlParts = pdfUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        
        if (uploadIndex === -1) {
            console.warn('Invalid Cloudinary URL format:', pdfUrl);
            return [];
        }
        
        // Get base URL (everything before 'upload')
        const baseUrl = urlParts.slice(0, uploadIndex + 1).join('/'); // https://res.cloudinary.com/your-cloud/image/upload
        
        // Get the version and path parts after 'upload'
        const pathParts = urlParts.slice(uploadIndex + 1);
        
        // Generate URLs for each page
        for (let i = 1; i <= pageCount; i++) {
            // Add page transformation and change extension to jpg
            const imageUrl = baseUrl + `/pg_${i}/` + pathParts.join('/').replace('.pdf', '.jpg');
            imageUrls.push(imageUrl);
        }
        
        console.log(`📄 Generated ${pageCount} PDF image URLs using Cloudinary transformations`);
        return imageUrls;
        
    } catch (error) {
        console.error('Error generating PDF image URLs:', error);
        return [];
    }
}

// Fallback function when poppler is not available
export async function convertPdfToPngUrlsSimple(fileBuffer: Buffer, fileName: string, pdfUrl?: string): Promise<string[]> {
    try {
        console.log("🔄 Starting simple PDF processing (no image conversion)...");

        // Load PDF to verify it's valid and count pages
        const pdfDoc = await PDFDocument.load(fileBuffer);
        const pageCount = pdfDoc.getPageCount();

        console.log(`📄 PDF loaded successfully: ${pageCount} pages`);
        console.log("⚠️ PDF to image conversion not available - poppler not installed");
        
        // If we have a PDF URL from Cloudinary, generate image URLs using transformations
        if (pdfUrl) {
            console.log("🔄 Generating PDF image URLs using Cloudinary transformations...");
            const imageUrls = generatePdfImageUrls(pdfUrl, pageCount);
            if (imageUrls.length > 0) {
                console.log(`✅ Generated ${imageUrls.length} PDF image URLs`);
                return imageUrls;
            }
        }
        
        console.log("📋 Package will be created without images - AI processing will be skipped");
        return [];

    } catch (error) {
        console.error("❌ Error processing PDF:", error);
        throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function convertPdfToPngUrls(fileBuffer: Buffer, fileName: string, pdfUrl?: string): Promise<string[]> {
    try {
        console.log("� Attempting PDF to image conversion...");

        // Try the pdf2pic method first
        const pdf2pic = require("pdf2pic");

        // Configure pdf2pic
        const convert = pdf2pic.fromBuffer(fileBuffer, {
            density: 150,
            saveFilename: "page",
            format: "png",
            width: 1200,
            height: 1600
        });

        // Try to convert just the first page as a test
        console.log("🧪 Testing PDF conversion with first page...");
        let testResult;

        try {
            testResult = await convert(1, { responseType: "base64" });
        } catch (testError) {
            console.log("❌ First page conversion test failed:", testError);
            throw new Error(`PDF conversion test failed: ${testError instanceof Error ? testError.message : 'Unknown error'}`);
        }

        // Check if we got valid base64 output
        if (!testResult || !testResult.base64 || testResult.base64.length === 0) {
            console.log("❌ No base64 output from pdf2pic - poppler likely not installed");
            throw new Error("PDF conversion test failed - no base64 output (poppler likely not installed)");
        }

        console.log("✅ PDF conversion test successful, proceeding with full conversion...");

        // Convert all pages
        const results = await convert.bulk(-1, { responseType: "base64" });
        console.log(`📄 Generated ${results.length} images from PDF`);

        if (results.length === 0) {
            throw new Error("No pages converted from PDF");
        }

        // Upload base64 images to Cloudinary
        const imageUrls: string[] = [];

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.base64) {
                try {
                    console.log(`📤 Uploading page ${i + 1}/${results.length} to Cloudinary...`);

                    // Convert base64 to buffer
                    const imageBuffer = Buffer.from(result.base64, 'base64');
                    const imageName = `${fileName.replace('.pdf', '')}_page_${i + 1}.png`;

                    // Upload to Cloudinary
                    const url = await uploadToCloudinary(imageBuffer, imageName);
                    imageUrls.push(url);

                    console.log(`✅ Uploaded page ${i + 1}: ${url}`);
                } catch (uploadError) {
                    console.error(`❌ Failed to upload page ${i + 1}:`, uploadError);
                }
            }
        }

        console.log(`🎉 Successfully processed ${imageUrls.length}/${results.length} pages`);
        return imageUrls;

    } catch (conversionError) {
        console.warn("⚠️ PDF to image conversion failed:", conversionError);

        // Check if it's a poppler/spawn error or no base64 output
        if (conversionError instanceof Error &&
            (conversionError.message.includes('ENOENT') ||
                conversionError.message.includes('spawn') ||
                conversionError.message.includes('pdftocairo') ||
                conversionError.message.includes('no base64 output') ||
                conversionError.message.includes('poppler likely not installed') ||
                conversionError.message.includes('PDF conversion test failed'))) {

            console.log("🔄 Poppler not available, falling back to simple PDF processing...");
            return await convertPdfToPngUrlsSimple(fileBuffer, fileName, pdfUrl);
        }

        // For other errors, re-throw
        throw new Error(`Failed to convert PDF to images: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}`);
    }
}
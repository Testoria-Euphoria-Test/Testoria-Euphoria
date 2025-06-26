import { PDFDocument } from 'pdf-lib';
import { uploadToCloudinary } from "./uploadToCloudinary";
import { generatePdfImageUrls } from "./pdfToImages";

/**
 * Process a PDF file for package creation
 * Returns the PDF URL and generated page image URLs
 */
export async function processPdfForPackage(fileBuffer: Buffer, fileName: string): Promise<{
    pdfUrl: string;
    pdfImages: string[];
    pageCount: number;
}> {
    try {
        console.log("🔄 Processing PDF for package creation...");

        // First, validate and count pages
        const pdfDoc = await PDFDocument.load(fileBuffer);
        const pageCount = pdfDoc.getPageCount();
        console.log(`📄 PDF validated: ${pageCount} pages`);

        // Upload PDF to Cloudinary
        console.log("📤 Uploading PDF to Cloudinary...");
        const pdfUrl = await uploadToCloudinary(fileBuffer, fileName);
        console.log(`✅ PDF uploaded: ${pdfUrl}`);

        // Generate page image URLs using Cloudinary transformations
        console.log("🔄 Generating page image URLs...");
        const pdfImages = generatePdfImageUrls(pdfUrl, pageCount);
        
        if (pdfImages.length === 0) {
            console.warn("⚠️ Could not generate page image URLs");
        } else {
            console.log(`✅ Generated ${pdfImages.length} page image URLs`);
        }

        return {
            pdfUrl,
            pdfImages,
            pageCount
        };

    } catch (error) {
        console.error("❌ Error processing PDF for package:", error);
        throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Get page count from PDF buffer
 */
export async function getPdfPageCount(fileBuffer: Buffer): Promise<number> {
    try {
        const pdfDoc = await PDFDocument.load(fileBuffer);
        return pdfDoc.getPageCount();
    } catch (error) {
        console.error("❌ Error getting PDF page count:", error);
        throw new Error(`Failed to read PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Regenerate pdfImages array for an existing PDF URL
 * Useful for fixing legacy packages or when PDF transformations change
 */
export function regeneratePdfImageUrls(pdfUrl: string, pageCount: number): string[] {
    console.log(`🔄 Regenerating PDF image URLs for ${pageCount} pages...`);
    const pdfImages = generatePdfImageUrls(pdfUrl, pageCount);
    
    if (pdfImages.length === 0) {
        console.warn("⚠️ Could not regenerate page image URLs");
    } else {
        console.log(`✅ Regenerated ${pdfImages.length} page image URLs`);
    }
    
    return pdfImages;
}

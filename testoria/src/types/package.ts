import { z } from "zod/v4";

// Question-related types for AI processing
export interface QuestionOption {
  A: string;
  B: string;
  C: string;
  D: string;
  E?: string;
}

export interface ProcessedQuestion {
  questionId: string;
  questionText: string;
  options: QuestionOption;
  correctAnswer: keyof QuestionOption;
  explanation: string;
  pageNumber: number;
  imageUrl: string;
}

export interface PackageContentItem {
  type: "summary" | "page" | "question";
  data?: any;
  pageNumber?: number;
  questions?: any[];
}

export const PackageSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters"),
  sourcePdf: z
    .array(z.url("Invalid PDF URL"))
    .min(1, "At least one PDF required"),
  pdfImages: z.array(z.url("Invalid image URL")).default([]), // Allow empty array, images generated from PDF
  images: z.array(z.url("Invalid image URL")).default([]), // Package cover images for slideshow
  contents: z.array(z.any()).default([]), // Allow empty array - content can be added via AI processing later
  categoryId: z.string().min(1, "Category is required"),
  creatorId: z.string().min(1, "Creator is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  price: z.number().min(0, "Price must be non-negative"),
  description: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export const PackageUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .optional(),
  sourcePdf: z
    .array(z.url("Invalid PDF URL"))
    .min(1, "At least one PDF required")
    .optional(),
  pdfImages: z.array(z.url("Invalid image URL")).optional(), // Allow empty array for updates
  images: z.array(z.url("Invalid image URL")).optional(), // Package cover images for slideshow
  contents: z.array(z.any()).optional(), // Allow empty array - content can be updated via AI processing
  categoryId: z.string().min(1, "Category is required").optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute").optional(),
  price: z.number().min(0, "Price must be non-negative").optional(),
  description: z.string().optional(),
  isPublished: z.boolean().optional(),
  ratings: z.array(z.any()).optional(),
  averageRating: z.number().optional(),
});

export type PackageType = z.infer<typeof PackageSchema>;
export type PackageUpdateType = z.infer<typeof PackageUpdateSchema>;

export interface PackageCreateInput {
  title: string;
  sourcePdf: string[];
  pdfImages: string[];
  images?: string[]; // Optional, default to empty array
  contents: any[]; // Can be empty array initially
  categoryId: string;
  creatorId: string;
  duration: number;
  price: number;
  rating: number;
  description?: string;
  isPublished?: boolean; // Default will be false
  ratings?: Array<{
    userId: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  averageRating?: number;
}

export interface PackageResponse {
  _id: string;
  title: string;
  sourcePdf: string[];
  pdfImages: string[];
  images: string[];
  contents: any[];
  categoryId: string;
  creatorId: string;
  duration: number;
  price: number;
  description: string;
  isPublished: boolean;
  rating: number;
  createdAt: Date;
  updatedAt?: Date;
  ratings?: number[];
  averageRating?: number
}
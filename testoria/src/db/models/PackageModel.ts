import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod/v4";
import {
  PackageSchema,
  PackageUpdateSchema,
  PackageCreateInput,
  PackageResponse,
  PackageUpdateType,
} from "@/types/package";

class PackageModel {
  static collection() {
    return database.collection("packages");
  }

  /**
   * Validates ObjectId format
   */
  private static validateObjectId(id: string): void {
    if (!ObjectId.isValid(id)) {
      throw { message: "Invalid ID format", status: 400 };
    }
  }

  /**
   * Creates a new package
   */
  static async create(data: PackageCreateInput) {
    try {
      // Validate input
      const validatedData = PackageSchema.parse(data);

      // Validate categoryId and creatorId format
      this.validateObjectId(validatedData.categoryId);
      this.validateObjectId(validatedData.creatorId);

      // Prepare insert document
      const packageToInsert = {
        title: validatedData.title,
        sourcePdf: validatedData.sourcePdf,
        pdfImages: validatedData.pdfImages,
        images: validatedData.images || [], // Default to empty array
        contents: validatedData.contents,
        categoryId: new ObjectId(validatedData.categoryId),
        creatorId: new ObjectId(validatedData.creatorId),
        duration: validatedData.duration,
        price: validatedData.price,
        description: validatedData.description || "",
        isPublished: validatedData.isPublished || false, // Default to false
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await this.collection().insertOne(packageToInsert);

      return {
        success: true,
        message: "Package created successfully",
        data: {
          _id: result.insertedId,
          ...packageToInsert,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw { message: error.issues[0].message, status: 400 };
      }
      throw error;
    }
  }

  /**
   * Gets all packages with optional filtering
   */
  static async findAll(filters?: {
    categoryId?: string;
    creatorId?: string;
    search?: string;
    status?: string;
  }) {
    try {
      const matchQuery: Record<string, unknown> = {};

      // Add filters
      if (filters?.categoryId) {
        this.validateObjectId(filters.categoryId);
        matchQuery.categoryId = new ObjectId(filters.categoryId);
      }

      if (filters?.creatorId) {
        this.validateObjectId(filters.creatorId);
        matchQuery.creatorId = new ObjectId(filters.creatorId);
      }

      // Add status filter
      if (filters?.status) {
        if (filters.status === "published") {
          matchQuery.isPublished = true;
        } else if (filters.status === "draft") {
          matchQuery.isPublished = false;
        }
      }

      const pipeline: Record<string, unknown>[] = [
        { $match: matchQuery },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
      ];

      // Add search filter after lookups to search creator names
      if (filters?.search) {
        pipeline.push({
          $match: {
            $or: [
              { title: { $regex: filters.search, $options: "i" } },
              { description: { $regex: filters.search, $options: "i" } },
              { "creator.name": { $regex: filters.search, $options: "i" } },
              { "category.name": { $regex: filters.search, $options: "i" } },
            ],
          },
        });
      }

      pipeline.push(
        {
          $addFields: {
            categoryName: "$category.name",
            creatorName: "$creator.name",
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            sourcePdf: 1,
            pdfImages: 1,
            images: 1,
            price: 1,
            contents: 1,
            duration: 1,
            description: 1,
            isPublished: 1,
            averageRating: 1,
            ratings: 1,
            createdAt: 1,
            updatedAt: 1,
            categoryId: 1,
            creatorId: 1,
            categoryName: 1,
            creatorName: 1,
          },
        },
        { $sort: { createdAt: -1 } }
      );

      const packages = await this.collection().aggregate(pipeline).toArray();
      return packages;
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to retrieve packages", status: 500 };
    }
  }

  /**
   * Gets packages with populated category and creator info
   */
  static async findAllWithDetails(filters?: {
    categoryId?: string;
    creatorId?: string;
    search?: string;
    status?: string;
  }) {
    try {
      const matchQuery: any = {};

      // Add filters
      if (filters?.categoryId) {
        this.validateObjectId(filters.categoryId);
        matchQuery.categoryId = new ObjectId(filters.categoryId);
      }

      if (filters?.creatorId) {
        this.validateObjectId(filters.creatorId);
        matchQuery.creatorId = new ObjectId(filters.creatorId);
      }

      // Add status filter
      if (filters?.status) {
        if (filters.status === "published") {
          matchQuery.isPublished = true;
        } else if (filters.status === "draft") {
          matchQuery.isPublished = false;
        }
      }

      const pipeline: any[] = [
        { $match: matchQuery },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
      ];

      // Add search filter after lookups to search creator names
      if (filters?.search) {
        pipeline.push({
          $match: {
            $or: [
              { title: { $regex: filters.search, $options: "i" } },
              { description: { $regex: filters.search, $options: "i" } },
              { "creator.name": { $regex: filters.search, $options: "i" } },
              { "creator.email": { $regex: filters.search, $options: "i" } },
            ],
          },
        });
      }

      pipeline.push(
        {
          $addFields: {
            categoryName: "$category.name",
            creatorName: "$creator.name",
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            sourcePdf: 1,
            pdfImages: 1,
            images: 1,
            price: 1,
            contents: 1,
            duration: 1,
            description: 1,
            isPublished: 1,
            createdAt: 1,
            updatedAt: 1,
            categoryId: 1,
            creatorId: 1,
            categoryName: 1,
            creatorName: 1,
            averageRating: 1,
            ratings: 1,
            "creator.email": 1,
            "creator.role": 1,
          },
        },
        { $sort: { createdAt: -1 } }
      );

      const packages = await this.collection().aggregate(pipeline).toArray();
      return packages;
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw {
        message: "Failed to retrieve packages with details",
        status: 500,
      };
    }
  }

  /**
   * Finds a package by ID
   */
  static async findById(packageId: string): Promise<PackageResponse> {
    try {
      this.validateObjectId(packageId);

      const pkg = await this.collection().findOne({
        _id: new ObjectId(packageId),
      });

      if (!pkg) {
        throw { message: "Package not found", status: 404 };
      }

      return pkg as unknown as PackageResponse;
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to find package", status: 500 };
    }
  }

  /**
   * Finds a package by ID with populated details
   */
  static async findByIdWithDetails(packageId: string) {
    try {
      this.validateObjectId(packageId);

      const pipeline = [
        { $match: { _id: new ObjectId(packageId) } },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: { path: "$creator", preserveNullAndEmptyArrays: true },
        },
        // ✅ Tambahkan lookup ke profiles berdasarkan creator._id
        {
          $lookup: {
            from: "profiles",
            localField: "creator._id", // Dari users._id
            foreignField: "userId", // Ke profiles.userId
            as: "creatorProfile",
          },
        },
        {
          $unwind: {
            path: "$creatorProfile",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            categoryName: "$category.name",
            creatorName: "$creator.name",
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            sourcePdf: 1,
            pdfImages: 1,
            images: 1, // Include images field
            contents: 1,
            duration: 1,
            price: 1,
            description: 1,
            isPublished: 1,
            createdAt: 1,
            updatedAt: 1,
            categoryId: 1,
            creatorId: 1,
            averageRating: 1,
            ratings: 1,
            categoryName: 1,
            creatorName: 1,
            "category._id": 1,
            "category.name": 1,
            "creator._id": 1,
            "creator.name": 1,
            "creator.email": 1,
            "creator.role": 1,
            "creatorProfile._id": 1,
            "creatorProfile.photoUrl": 1,
            "creatorProfile.education": 1,
            "creatorProfile.certificates": 1,
            "creatorProfile.bio": 1,
          },
        },
      ];

      const result = await this.collection().aggregate(pipeline).toArray();

      if (result.length === 0) {
        throw { message: "Package not found", status: 404 };
      }

      return result[0];
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to find package with details", status: 500 };
    }
  }

  /**
   * Updates a package by ID
   */
  static async updateById(packageId: string, data: PackageUpdateType) {
    try {
      this.validateObjectId(packageId);

      // Validate input
      const validatedData = PackageUpdateSchema.parse(data);

      // Validate categoryId if provided
      if (validatedData.categoryId) {
        this.validateObjectId(validatedData.categoryId);
      }

      // Prepare update data
      const updateData: any = {
        ...validatedData,
        updatedAt: new Date(),
      };

      // Convert categoryId to ObjectId if provided
      if (updateData.categoryId) {
        updateData.categoryId = new ObjectId(updateData.categoryId);
      }

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const result = await this.collection().updateOne(
        { _id: new ObjectId(packageId) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        throw { message: "Package not found", status: 404 };
      }

      return {
        success: true,
        message: "Package updated successfully",
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw { message: error.issues[0].message, status: 400 };
      }
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to update package", status: 500 };
    }
  }

  /**
   * Deletes a package by ID
   */
  static async deleteById(packageId: string) {
    try {
      this.validateObjectId(packageId);

      const result = await this.collection().deleteOne({
        _id: new ObjectId(packageId),
      });

      if (result.deletedCount === 0) {
        throw { message: "Package not found", status: 404 };
      }

      return {
        success: true,
        message: "Package deleted successfully",
      };
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to delete package", status: 500 };
    }
  }

  /**
   * Gets packages by creator ID
   */
  static async findByCreatorId(creatorId: string): Promise<PackageResponse[]> {
    try {
      this.validateObjectId(creatorId);

      const packages = await this.collection()
        .find({ creatorId: new ObjectId(creatorId) })
        .sort({ createdAt: -1 })
        .toArray();

      return packages as unknown as PackageResponse[];
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to find packages by creator", status: 500 };
    }
  }

  /**
   * Gets packages by category ID
   */
  static async findByCategoryId(
    categoryId: string
  ): Promise<PackageResponse[]> {
    try {
      this.validateObjectId(categoryId);

      const packages = await this.collection()
        .find({ categoryId: new ObjectId(categoryId) })
        .sort({ createdAt: -1 })
        .toArray();

      return packages as unknown as PackageResponse[];
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to find packages by category", status: 500 };
    }
  }

  /**
   * Counts total packages
   */
  static async count(filters?: {
    categoryId?: string;
    creatorId?: string;
  }): Promise<number> {
    try {
      const query: any = {};

      if (filters?.categoryId) {
        this.validateObjectId(filters.categoryId);
        query.categoryId = new ObjectId(filters.categoryId);
      }

      if (filters?.creatorId) {
        this.validateObjectId(filters.creatorId);
        query.creatorId = new ObjectId(filters.creatorId);
      }

      return await this.collection().countDocuments(query);
    } catch (error) {
      throw { message: "Failed to count packages", status: 500 };
    }
  }

  /**
   * Gets only published packages for customer view
   */
  static async findAllPublished(filters?: {
    categoryId?: string;
    search?: string;
  }) {
    try {
      const query: any = { isPublished: true }; // Only published packages

      // Add filters
      if (filters?.categoryId) {
        this.validateObjectId(filters.categoryId);
        query.categoryId = new ObjectId(filters.categoryId);
      }

      if (filters?.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: "i" } },
          { description: { $regex: filters.search, $options: "i" } },
        ];
      }

      const packages = await this.collection()
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      // Ensure all packages have averageRating field with default value
      const packagesWithRating = packages.map((pkg) => ({
        ...pkg,
        averageRating: pkg.averageRating || 0,
        ratings: pkg.ratings || [],
      }));

      return packagesWithRating as unknown as PackageResponse[];
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to retrieve published packages", status: 500 };
    }
  }

  /**
   * Toggles the published status of a package
   */
  static async togglePublishStatus(packageId: string, isPublished: boolean) {
    try {
      this.validateObjectId(packageId);

      const result = await this.collection().updateOne(
        { _id: new ObjectId(packageId) },
        {
          $set: {
            isPublished: isPublished,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        throw { message: "Package not found", status: 404 };
      }

      return {
        success: true,
        message: `Package ${
          isPublished ? "published" : "unpublished"
        } successfully`,
      };
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to update publish status", status: 500 };
    }
  }

  /**
   * Gets all packages by creator (published and unpublished for creator view)
   */
  static async findByCreatorIdAll(
    creatorId: string,
    publishedOnly: boolean = false
  ): Promise<PackageResponse[]> {
    try {
      this.validateObjectId(creatorId);

      const query: any = { creatorId: new ObjectId(creatorId) };

      // If publishedOnly is true, filter for published packages only
      if (publishedOnly) {
        query.isPublished = true;
      }

      const packages = await this.collection()
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      return packages as unknown as PackageResponse[];
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to find packages by creator", status: 500 };
    }
  }

  /**
   * Gets published packages by category for customer view
   */
  static async findPublishedByCategoryId(
    categoryId: string
  ): Promise<PackageResponse[]> {
    try {
      this.validateObjectId(categoryId);

      const packages = await this.collection()
        .find({
          categoryId: new ObjectId(categoryId),
          isPublished: true, // Only published packages
        })
        .sort({ createdAt: -1 })
        .toArray();

      return packages as unknown as PackageResponse[];
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw {
        message: "Failed to find published packages by category",
        status: 500,
      };
    }
  }

  /**
   * Counts packages with publish status filter
   */
  static async countWithPublishStatus(filters?: {
    categoryId?: string;
    creatorId?: string;
    publishedOnly?: boolean;
  }): Promise<number> {
    try {
      const query: any = {};

      if (filters?.categoryId) {
        this.validateObjectId(filters.categoryId);
        query.categoryId = new ObjectId(filters.categoryId);
      }

      if (filters?.creatorId) {
        this.validateObjectId(filters.creatorId);
        query.creatorId = new ObjectId(filters.creatorId);
      }

      if (filters?.publishedOnly) {
        query.isPublished = true;
      }

      return await this.collection().countDocuments(query);
    } catch (error) {
      throw { message: "Failed to count packages", status: 500 };
    }
  }
}

export default PackageModel;

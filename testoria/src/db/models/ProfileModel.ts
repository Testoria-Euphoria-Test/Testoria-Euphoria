import { z } from "zod/v4";
import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";
import { ProfileInput, ProfileType } from "@/types/profile";

// Validation schemas
const ProfileSchema = z.object({
  photoUrl: z.url("Invalid photo URL").optional().or(z.literal("")),
  education: z.string().max(200, "Education description too long").optional(),
  certificates: z
    .array(z.string().trim().min(1, "Certificate url cannot be empty"))
    .max(10, "Too many certificates")
    .optional(),
  bio: z.string().max(500, "Bio too long").optional(),
});

class ProfileModel {
  static collection() {
    return database.collection("profiles");
  }

  //Validates ObjectId format
  private static validateObjectId(id: string): void {
    if (!ObjectId.isValid(id)) {
      throw { message: "Invalid ID format", status: 400 };
    }
  }

  //Creates a new profile for a user
  static async create(userId: string, input: ProfileInput) {
    try {
      this.validateObjectId(userId);

      // Validate input
      const validatedData = ProfileSchema.parse(input);

      // Check if user already has a profile
      const existingProfile = await this.collection().findOne({
        userId: new ObjectId(userId),
      });

      if (existingProfile) {
        throw { message: "User already has a profile", status: 409 };
      }

      // Insert profile
      const profileData = {
        userId: new ObjectId(userId),
        photoUrl: validatedData.photoUrl || "",
        education: validatedData.education || "",
        certificates: validatedData.certificates || [],
        bio: validatedData.bio || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await this.collection().insertOne(profileData);

      return {
        success: true,
        message: "Profile created successfully",
        data: {
          _id: result.insertedId,
          ...profileData,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw { message: error.issues[0].message, status: 400 };
      }
      throw error;
    }
  }

  //Gets all profiles (for admin or public viewing)
  static async getAllProfiles(): Promise<ProfileType[]> {
    try {
      const profiles = await this.collection()
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return profiles as unknown as ProfileType[];
    } catch (error) {
      throw {
        message: (error as Error).message || "Failed to retrieve profiles",
        status: 500,
      };
    }
  }

  //Finds a profile by profile ID
  static async findById(profileId: string): Promise<ProfileType> {
    try {
      this.validateObjectId(profileId);

      const profile = await this.collection().findOne({
        _id: new ObjectId(profileId),
      });

      if (!profile) {
        throw { message: "Profile not found", status: 404 };
      }

      return profile as unknown as ProfileType;
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to find profile", status: 500 };
    }
  }

  //Finds a profile by user ID
  static async findByUserId(userId: string): Promise<ProfileType | null> {
    try {
      this.validateObjectId(userId);

      const profile = await this.collection().findOne({
        userId: new ObjectId(userId),
      });

      return profile as unknown as ProfileType | null;
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to find profile by user ID", status: 500 };
    }
  }

  //Finds a profile by user ID with joined user data
  static async findByUserIdWithUser(userId: string) {
    try {
      this.validateObjectId(userId);

      const pipeline = [
        { $match: { userId: new ObjectId(userId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            userId: 1,
            photoUrl: 1,
            education: 1,
            certificates: 1,
            bio: 1,
            createdAt: 1,
            updatedAt: 1,
            "user._id": 1,
            "user.name": 1,
            "user.email": 1,
            "user.role": 1,
          },
        },
      ];

      const result = await this.collection().aggregate(pipeline).toArray();

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to find profile with user info by user ID", status: 500 };
    }
  }

  //Updates a profile by profile ID
  static async updateById(profileId: string, input: ProfileInput) {
    try {
      this.validateObjectId(profileId);

      // Validate input
      const validatedData = ProfileSchema.parse(input);

      // Check if profile exists
      const existingProfile = await this.findById(profileId);

      // Prepare update data
      const updateData: any = {
        ...validatedData,
        updatedAt: new Date(),
      };

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const result = await this.collection().updateOne(
        { _id: new ObjectId(profileId) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        throw { message: "Profile not found", status: 404 };
      }

      return {
        success: true,
        message: "Profile updated successfully",
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw { message: error.issues[0].message, status: 400 };
      }
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to update profile", status: 500 };
    }
  }

  //Updates a profile by user ID
  static async updateByUserId(userId: string, input: ProfileInput) {
    try {
      this.validateObjectId(userId);

      // Find profile by user ID first
      const profile = await this.findByUserId(userId);
      if (!profile || !profile._id) {
        throw { message: "Profile not found", status: 404 };
      }

      // Update using profile ID
      return await this.updateById(profile._id.toString(), input);
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to update profile by user ID", status: 500 };
    }
  }

  //Deletes a profile by profile ID
  static async deleteById(profileId: string) {
    try {
      this.validateObjectId(profileId);

      const result = await this.collection().deleteOne({
        _id: new ObjectId(profileId),
      });

      if (result.deletedCount === 0) {
        throw { message: "Profile not found", status: 404 };
      }

      return {
        success: true,
        message: "Profile deleted successfully",
      };
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to delete profile", status: 500 };
    }
  }

  //Checks if a profile exists for a user
  static async existsForUser(userId: string): Promise<boolean> {
    try {
      this.validateObjectId(userId);
      const count = await this.collection().countDocuments({
        userId: new ObjectId(userId),
      });
      return count > 0;
    } catch (error) {
      return false;
    }
  }

  //Gets profile with user information (populated)
  static async getProfileWithUser(profileId: string) {
    try {
      this.validateObjectId(profileId);

      const pipeline = [
        { $match: { _id: new ObjectId(profileId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            photoUrl: 1,
            education: 1,
            certificates: 1,
            bio: 1,
            createdAt: 1,
            updatedAt: 1,
            "user.email": 1,
            "user.role": 1,
          },
        },
      ];

      const result = await this.collection().aggregate(pipeline).toArray();

      if (result.length === 0) {
        throw { message: "Profile not found", status: 404 };
      }

      return result[0];
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw { message: "Failed to get profile with user info", status: 500 };
    }
  }
}

export default ProfileModel;

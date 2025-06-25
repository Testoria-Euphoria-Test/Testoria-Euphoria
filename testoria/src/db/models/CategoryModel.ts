import { z } from "zod/v4";
import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";

export interface CategoryType {
    _id: string
    name: string
}

const CategorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
});

class CategoryModel {
    static collection() {
        return database.collection("categories");
    }

    static async create(newCategory: CategoryType) {
        // Basic validation first
        CategorySchema.parse(newCategory);

        // Check for duplicate category name
        const existingCategory = await this.collection().findOne({ name: newCategory.name });
        if (existingCategory) {
            throw { message: "Category name already exists", status: 400 };
        }

        // Prepare category document for insertion
        const categoryToInsert = {
            name: newCategory.name
        };

        const result = await this.collection().insertOne(categoryToInsert);
        return {
            message: "Category created successfully",
            data: { _id: result.insertedId, ...categoryToInsert }
        };
    }

    static async getAllCategories() {
        const categories = await this.collection().find({}).sort({ name: 1 }).toArray();
        return categories;
    }

    static async findById(categoryId: string) {
        if (!ObjectId.isValid(categoryId)) {
            throw { message: "Invalid category ID", status: 400 };
        }

        const category = await this.collection().findOne({ _id: new ObjectId(categoryId) });

        if (!category) {
            throw { message: "Category not found", status: 404 };
        }

        return category;
    }

    static async updateById(categoryId: string, updateData: Partial<CategoryType>) {
        if (!ObjectId.isValid(categoryId)) {
            throw { message: "Invalid category ID", status: 400 };
        }

        // Validate update data
        if (updateData.name) {
            CategorySchema.parse(updateData);

            // Check for duplicate name (excluding current category)
            const existingCategory = await this.collection().findOne({
                name: updateData.name,
                _id: { $ne: new ObjectId(categoryId) }
            });
            if (existingCategory) {
                throw { message: "Category name already exists", status: 400 };
            }
        }

        // Prepare update data
        const dataToUpdate = {
            ...updateData
        };

        const result = await this.collection().updateOne(
            { _id: new ObjectId(categoryId) },
            { $set: dataToUpdate }
        );

        if (result.matchedCount === 0) {
            throw { message: "Category not found", status: 404 };
        }

        return { message: "Category updated successfully" };
    }

    static async deleteById(categoryId: string) {
        if (!ObjectId.isValid(categoryId)) {
            throw { message: "Invalid category ID", status: 400 };
        }

        const result = await this.collection().deleteOne({ _id: new ObjectId(categoryId) });

        if (result.deletedCount === 0) {
            throw { message: "Category not found", status: 404 };
        }

        return { message: "Category deleted successfully" };
    }

    static async findByName(name: string) {
        const category = await this.collection().findOne({ name });
        return category;
    }
}

export default CategoryModel;
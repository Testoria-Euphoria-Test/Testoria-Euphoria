import CategoryModel from "@/db/models/CategoryModel";
import errorHandler from "@/helpers/errorHandler";

export async function GET() {
  try {
    // GET is public - no authentication required
    const categories = await CategoryModel.getAllCategories();

    return Response.json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // POST is public - no authentication required
    const result = await CategoryModel.create(body);

    return Response.json(result, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}

import UserModel from "@/db/models/UserModel";
import errorHandler from "@/helpers/errorHandler";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const user = await UserModel.create(body);
        return Response.json(user);
    } catch (error) {
        return errorHandler(error);
    }
}
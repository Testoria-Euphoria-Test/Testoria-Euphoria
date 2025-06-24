import { ZodError } from "zod/v4";

export default function errorHandler(error: unknown) {
    const err = error as { message: string; status: number };
    let message = err.message;
    let status = err.status || 500;
    if (error instanceof ZodError) {
        message = error.issues[0].message;
        status = 400;
    }
    return Response.json({ message }, { status });
}
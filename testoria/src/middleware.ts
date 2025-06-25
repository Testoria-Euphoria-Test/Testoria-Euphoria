import { cookies } from "next/headers";
import errorHandler from "./helpers/errorHandler";
import { verifyTokenAsync } from "./helpers/jwt";
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
    try {
        const cookieStore = await cookies();
        const authorization = cookieStore.get('Authorization');
        if (!authorization) {
            throw { message: "Please login first", status: 401 };
        }
        const [type, token] = authorization.value.split(' ');
        if (type !== 'Bearer' || !token) {
            throw { message: "Invalid token format", status: 401 };
        }
        const decoded = await verifyTokenAsync<{ email: string, _id: string }>(token);
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-id', decoded._id);
        requestHeaders.set('x-user-email', decoded.email);
        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
        return response;
    } catch (error) {
        return errorHandler(error);
    }
}

export const config = {
    matcher: '/api/users/:path*',
}
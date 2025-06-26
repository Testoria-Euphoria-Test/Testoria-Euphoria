import { cookies } from "next/headers";
import errorHandler from "./helpers/errorHandler";
import { verifyTokenAsync } from "./helpers/jwt";
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
    try {
        const url = new URL(request.url);
        const method = request.method;

        console.log(`Middleware triggered for: ${method} ${url.pathname}`);

        // Allow public GET requests for published packages
        if (url.pathname === '/api/packages' && method === 'GET') {
            console.log(`Allowing public access to GET /api/packages`);
            return NextResponse.next();
        }

        // Allow public GET requests for individual published packages
        if (url.pathname.match(/^\/api\/packages\/[^\/]+$/) && method === 'GET') {
            console.log(`Allowing public access to GET ${url.pathname}`);
            return NextResponse.next();
        }

        // Allow public GET and POST requests for categories collection
        if (url.pathname === '/api/categories' && (method === 'GET' || method === 'POST')) {
            console.log(`Allowing public access to ${method} /api/categories`);
            return NextResponse.next();
        }

        // Allow public GET requests for individual category viewing
        if (url.pathname.startsWith('/api/categories/') && method === 'GET') {
            console.log(`Allowing public access to ${method} ${url.pathname}`);
            return NextResponse.next();
        }

        // Allow public GET requests for individual profile viewing (creators)
        if (url.pathname.startsWith('/api/profiles/') && 
            url.pathname !== '/api/profiles/me' && 
            method === 'GET') {
            console.log(`Allowing public access to ${method} ${url.pathname}`);
            return NextResponse.next();
        }

        // Allow access to AI testing endpoint for development
        if (url.pathname === '/api/test-ai') {
            console.log(`Allowing access to AI testing endpoint`);
            return NextResponse.next();
        }

        // For all other protected routes, require authentication
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
    matcher: [
        '/api/users/:path*',
        '/api/categories/:path*',
        '/api/profiles/:path*',
        '/api/packages/:path*',
        '/api/test-ai/:path*'
    ],
}
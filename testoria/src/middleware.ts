import { cookies } from "next/headers";
import errorHandler from "./helpers/errorHandler";
import { verifyTokenAsync } from "./helpers/jwt";
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
    try {
        const url = new URL(request.url);
        const method = request.method;

        // Allow public GET requests for published packages
        if (url.pathname === '/api/packages' && method === 'GET') {
            return NextResponse.next();
        }

        // Allow public GET requests for individual published packages (but not my-packages)
        if (url.pathname.match(/^\/api\/packages\/[^\/]+$/) && method === 'GET' && url.pathname !== '/api/packages/my-packages') {
            return NextResponse.next();
        }

        // Allow public GET and POST requests for categories collection
        if (url.pathname === '/api/categories' && (method === 'GET' || method === 'POST')) {
            return NextResponse.next();
        }

        // Allow public GET requests for individual category viewing
        if (url.pathname.startsWith('/api/categories/') && method === 'GET') {
            return NextResponse.next();
        }

        // Allow public GET requests for individual profile viewing (creators)
        if (url.pathname.startsWith('/api/profiles/') &&
            method === 'GET') {
            return NextResponse.next();
        }

        // Allow access to AI testing endpoint for development
        if (url.pathname === '/api/test-ai') {
            return NextResponse.next();
        }

        // Allow public GET requests for questions (for users who purchased packages)
        if (url.pathname === '/api/questions' && method === 'GET') {
            return NextResponse.next();
        }

        // Allow public access to Midtrans notification endpoint
        if (url.pathname === '/api/payments/notify' && method === 'POST') {
            return NextResponse.next();
        }

        // For all other protected routes, require authentication
        const cookieStore = await cookies();
        const authorization = cookieStore.get('Authorization');
        const userRoleCookie = cookieStore.get('x-user-role');

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

        // Set user role from cookie if available
        if (userRoleCookie?.value) {
            requestHeaders.set('x-user-role', userRoleCookie.value);
        }

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
        '/api/auth/:path*',
        '/api/categories/:path*',
        '/api/categories',
        '/api/profiles/:path*',
        '/api/profile/:path*',
        '/api/packages/:path*',
        '/api/payments/:path*',
        '/api/questions/:path*',
        '/api/user-answers/:path*',
        '/api/results/:path*',
        '/api/test-ai/:path*',
        '/api/creator/:path*',
        '/api/admin/:path*'

    ],
}
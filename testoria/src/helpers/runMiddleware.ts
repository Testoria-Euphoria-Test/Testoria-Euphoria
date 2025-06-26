import { NextRequest, NextResponse } from 'next/server';

interface MiddlewareCallback {
    (error?: Error | null): void;
}

interface MiddlewareFunction {
    (req: NextRequest, res: NextResponse, callback: MiddlewareCallback): void;
}

export function runMiddleware(
    req: NextRequest, 
    res: NextResponse, 
    fn: MiddlewareFunction
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fn(req, res, (result?: Error | null) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve();
        });
    });
}
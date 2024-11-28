import {NextResponse} from 'next/server'
import {v4 as uuidv4} from 'uuid';

// This function can be marked `async` if using `await` inside
export function middleware(request) {
    const response = NextResponse.next()
    
    if (request.nextUrl.pathname.startsWith("/api")) {
        const token = request.cookies.get('token')?.value || '';
        if (token === '') {
            return NextResponse.json({status: 401, error: "请求失败"})
        }
    } else {
        response.cookies.set({
            name: 'token', value: uuidv4(),
            maxAge: 60 * 60,
        });
    }

    return response;
}
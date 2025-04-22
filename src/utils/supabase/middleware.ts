import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                supabaseResponse = NextResponse.next({
                    request,
                });
                cookiesToSet.forEach(({ name, value }) => supabaseResponse.cookies.set(name, value));
            },
        },
    });

    const { data } = await supabase.auth.getUser();
    const { pathname } = request.nextUrl.clone();
    const isApi = pathname.startsWith('/api');

    if (!data.user && !pathname.startsWith('/signup') && !pathname.startsWith('/signin') && !isApi) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    if (data.user && (pathname.startsWith('/signup') || pathname.startsWith('/signin')) && !isApi) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return supabaseResponse;
}

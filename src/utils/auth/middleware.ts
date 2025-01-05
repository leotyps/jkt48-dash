// ./utils/auth/middleware.ts
import { NextMiddleware, NextResponse } from 'next/server';
import { middleware_hasServerSession } from './server';  // Impor sesi dari server
import { middleware_hasGoogleServerSession } from './googleServer';  // Impor sesi dari Google

export const withAuth = (authUrl: string, middleware: NextMiddleware): NextMiddleware => {
  return (req, evt) => {
    // Cek sesi dari server dan Google menggunakan NextRequest
    const loggedIn = middleware_hasServerSession(req) || middleware_hasGoogleServerSession(req);

    // Jika tidak ada sesi yang valid, redirect ke halaman autentikasi
    if (!loggedIn) {
      const url = req.nextUrl.clone();
      url.pathname = authUrl;

      return NextResponse.redirect(url);
    }

    // Jika ada sesi yang valid, lanjutkan dengan middleware berikutnya
    return middleware(req, evt);
  };
};

export default withAuth('/auth/signin', () => NextResponse.next());

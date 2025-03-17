import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routes, isProtectedRoute, isApiRoute, getLoginRedirectPath } from '@/config/routes';

// Implementación simple de rate limiting en memoria
class RateLimiter {
  private requests: Map<string, number[]>;
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.requests = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async limit(ip: string): Promise<{ success: boolean; limit: number; reset: number; remaining: number }> {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Obtener o inicializar el array de timestamps para este IP
    let timestamps = this.requests.get(ip) || [];
    
    // Eliminar timestamps antiguos
    timestamps = timestamps.filter(timestamp => timestamp > windowStart);
    
    // Verificar si se excedió el límite
    const success = timestamps.length < this.maxRequests;
    
    if (success) {
      timestamps.push(now);
    }
    
    // Actualizar el mapa
    this.requests.set(ip, timestamps);
    
    // Calcular el tiempo hasta el siguiente reset
    const reset = windowStart + this.windowMs;
    
    return {
      success,
      limit: this.maxRequests,
      reset,
      remaining: Math.max(0, this.maxRequests - timestamps.length)
    };
  }
}

// Crear un nuevo rate limiter que permite 100 peticiones por 15 minutos
const ratelimit = new RateLimiter(
  15 * 60 * 1000, // 15 minutos en milisegundos
  Number(process.env.RATE_LIMIT_MAX) || 100
);

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                      req.nextUrl.pathname.startsWith('/register');
    const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard');
    const isQrAccessPage = req.nextUrl.pathname.startsWith('/qr-access');
    const isProfilePage = req.nextUrl.pathname.startsWith('/profile');

    // 1. Manejo de páginas de autenticación (login/register)
    if (isAuthPage) {
      if (isAuth) {
        // Si está autenticado, redirigir según el rol
        const redirectUrl = token.role === 'admin' ? '/dashboard' : '/qr-access';
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
      // Si no está autenticado, permitir acceso a páginas de auth
      return NextResponse.next();
    }

    // 2. Verificación de autenticación para rutas protegidas
    if (!isAuth) {
      // Guardar la URL actual como callbackUrl
      let callbackUrl = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        callbackUrl += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.url)
      );
    }

    // 3. Verificación de roles y acceso
    if (isDashboardPage) {
      // Solo admins pueden acceder al dashboard
      if (token.role !== 'admin') {
        return NextResponse.redirect(new URL('/qr-access', req.url));
      }
    }

    if (isQrAccessPage || isProfilePage) {
      // Estas páginas requieren autenticación pero son accesibles para todos los roles
      return NextResponse.next();
    }

    // 4. Por defecto, permitir acceso a usuarios autenticados
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true // La autorización se maneja en la función middleware
    },
  }
);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Obtener el token de la sesión
  const token = await getToken({ req: request });

  // Verificar si es una ruta de API
  if (isApiRoute(path)) {
    try {
      // Obtener el IP del cliente
      const forwardedFor = request.headers.get('x-forwarded-for');
      const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
      
      // Verificar el rate limit
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);

      // Añadir headers de rate limit
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', reset.toString());

      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests' }),
          { status: 429, headers: response.headers }
        );
      }

      return response;
    } catch (error) {
      console.error('Error en rate limiting:', error);
      // En caso de error, permitir la petición
      return NextResponse.next();
    }
  }

  // Verificar rutas protegidas
  if (isProtectedRoute(path)) {
    if (!token) {
      const url = new URL(routes.public.login, request.url);
      url.searchParams.set('callbackUrl', getLoginRedirectPath(path));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/user/:path*',
    '/qr-access/:path*',
    '/profile/:path*',
    '/materials/:path*',
    '/perks/:path*',
    '/scan/:path*',
  ],
}; 
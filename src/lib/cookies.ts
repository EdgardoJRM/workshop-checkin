import { cookies } from 'next/headers';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

// Nombre de la cookie para el token de autenticación
export const TOKEN_COOKIE_NAME = 'token';

// Opciones por defecto para las cookies
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  // 7 días en segundos
  maxAge: 7 * 24 * 60 * 60
};

// Tiempo de expiración predeterminado para las cookies (8 horas en segundos)
export const DEFAULT_COOKIE_EXPIRY = 8 * 60 * 60; 

// Opciones para las cookies dependiendo del entorno
export const getCookieOptions = (expiry = DEFAULT_COOKIE_EXPIRY) => {
  return {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: expiry,
    path: '/',
    sameSite: 'lax' as const,
  };
};

interface CookieOptions extends Partial<ResponseCookie> {
  name: string;
  value: string;
}

// Función para establecer una cookie
export function setCookie(options: CookieOptions) {
  cookies().set({
    name: options.name,
    value: options.value,
    httpOnly: options.httpOnly !== false,
    path: options.path || '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: options.sameSite || 'lax',
    maxAge: options.maxAge || 60 * 60 * 24, // 24 horas por defecto
    expires: options.expires,
    domain: options.domain,
    priority: options.priority,
  });
}

// Función para obtener una cookie
export function getCookie(name: string): string | undefined {
  const cookie = cookies().get(name);
  return cookie?.value;
}

// Función para eliminar una cookie
export function deleteCookie(name: string) {
  cookies().delete(name);
}

// Función para establecer el token JWT en una cookie
export function setAuthToken(token: string, maxAge?: number) {
  setCookie({
    name: TOKEN_COOKIE_NAME,
    value: token,
    maxAge: maxAge || DEFAULT_COOKIE_EXPIRY,
  });
}

// Función para eliminar el token JWT
export function removeAuthToken() {
  deleteCookie(TOKEN_COOKIE_NAME);
} 
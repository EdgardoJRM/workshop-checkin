import { NextResponse } from 'next/server';
import { TOKEN_COOKIE_NAME } from '@/lib/cookies';

export async function POST() {
  try {
    // Crear respuesta
    const response = NextResponse.json(
      { success: true, message: 'Sesión cerrada exitosamente' },
      { status: 200 }
    );

    // Eliminar la cookie de autenticación
    response.cookies.delete(TOKEN_COOKIE_NAME);

    return response;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
} 
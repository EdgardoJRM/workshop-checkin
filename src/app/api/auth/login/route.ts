import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { sign } from '@/lib/jwt';
import { TOKEN_COOKIE_NAME, getCookieOptions } from '@/lib/cookies';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Verificar datos obligatorios
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await db.user.findUnique({
      where: { email }
    });

    // Verificar si el usuario existe
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Usuario inactivo, contacte al administrador' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = await sign({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Establecer cookie con el token
    const cookieStore = cookies();
    cookieStore.set(TOKEN_COOKIE_NAME, token, getCookieOptions());

    // Retornar respuesta exitosa con datos básicos del usuario
    return NextResponse.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 
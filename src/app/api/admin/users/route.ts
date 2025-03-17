import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Definir tipos para la respuesta de la API
type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// Definir interfaces para los tipos
interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface Session {
  user?: SessionUser;
}

interface UserPerk {
  perk: {
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  perks: UserPerk[];
}

interface FormattedUser extends Omit<User, 'perks'> {
  perks: string[];
  eventAccess: string[];
}

// Helper function to create JSON responses
function jsonResponse<T>(data: ApiResponse<T>, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET() {
  try {
    console.log('Iniciando obtención de usuarios...');
    
    // Verificar sesión
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      console.log('Usuario no autorizado:', session?.user);
      return jsonResponse<never>(
        { error: 'No autorizado' },
        401
      );
    }

    // Obtener usuarios
    const users = await db.user.findMany();

    // Formatear usuarios para omitir información sensible
    const formattedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    // Retornar directamente el array de usuarios
    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
} 
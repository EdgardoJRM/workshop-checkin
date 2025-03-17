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
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Obtener usuarios usando DynamoDB
    const allItems = await db.user.findMany();
    const users = allItems
      .filter(item => item.type === 'user' || !item.type) // Incluir usuarios sin tipo por compatibilidad
      .map(({ password, ...user }) => user); // Excluir contraseñas

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
} 
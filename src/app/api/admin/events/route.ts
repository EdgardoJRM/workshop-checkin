import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Verificar que el usuario es admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, date, location, capacity } = body;

    // Validar datos requeridos
    if (!name || !date || !location) {
      return NextResponse.json(
        { error: 'Nombre, fecha y ubicación son requeridos' },
        { status: 400 }
      );
    }

    // Crear evento
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        location,
        capacity: capacity || null,
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error al crear evento:', error);
    return NextResponse.json(
      { error: 'Error al crear el evento' },
      { status: 500 }
    );
  }
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

    const events = await prisma.event.findMany({
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return NextResponse.json(
      { error: 'Error al obtener eventos' },
      { status: 500 }
    );
  }
} 
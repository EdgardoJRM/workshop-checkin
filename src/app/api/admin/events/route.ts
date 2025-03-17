import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

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

    // Crear evento usando DynamoDB
    const event = await db.user.create({
      id: Date.now().toString(), // Generar un ID único
      name,
      description,
      date: new Date(date).toISOString(),
      location,
      capacity: capacity || null,
      type: 'event' // Agregar un discriminador para diferenciar eventos de usuarios
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

    // Obtener eventos usando DynamoDB
    const allItems = await db.user.findMany();
    const events = allItems.filter(item => item.type === 'event')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return NextResponse.json(
      { error: 'Error al obtener eventos' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Obtener logs de acceso usando DynamoDB
    const allItems = await db.user.findMany();
    const accessLogs = allItems
      .filter(item => item.type === 'access_log' && item.userId === session.user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(accessLogs);
  } catch (error) {
    console.error('Error al obtener logs de acceso:', error);
    return NextResponse.json(
      { error: 'Error al obtener logs de acceso' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { eventId, eventName } = await request.json();

    // Crear log de acceso usando DynamoDB
    const accessLog = await db.user.create({
      id: Date.now().toString(),
      userId: session.user.id,
      eventId,
      eventName,
      type: 'access_log',
      createdAt: new Date()
    });

    return NextResponse.json(accessLog);
  } catch (error) {
    console.error('Error al crear log de acceso:', error);
    return NextResponse.json(
      { error: 'Error al crear log de acceso' },
      { status: 500 }
    );
  }
} 
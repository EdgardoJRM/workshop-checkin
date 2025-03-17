import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const accessLogs = await prisma.accessLog.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        event: {
          select: {
            name: true,
            location: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10 // Limitamos a los últimos 10 accesos
    });

    return NextResponse.json(accessLogs);
  } catch (error) {
    console.error('Error al obtener historial de accesos:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial de accesos' },
      { status: 500 }
    );
  }
} 
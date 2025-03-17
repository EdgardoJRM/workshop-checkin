import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import QRCode from 'qrcode';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Obtener usuario usando DynamoDB
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Generar datos para el código QR
    const qrData = {
      id: user.id,
      name: user.name,
      email: user.email,
      perks: user.perks,
      eventAccess: user.eventAccess
    };

    // Generar código QR
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error('Error al generar código QR:', error);
    return NextResponse.json(
      { error: 'Error al generar código QR' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import QRCode from 'qrcode';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Verificar sesión
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el usuario con sus perks y accesos a eventos
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        perks: {
          select: {
            perk: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Crear objeto con la información que queremos en el QR
    const qrData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      perks: user.perks.map(p => p.perk.name),
      timestamp: new Date().toISOString()
    };

    // Generar QR code como data URL
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData), {
      type: 'image/png',
      margin: 1,
      width: 512,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error('Error al generar QR:', error);
    return NextResponse.json(
      { error: 'Error al generar el código QR' },
      { status: 500 }
    );
  }
} 
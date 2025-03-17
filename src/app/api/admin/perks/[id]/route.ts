import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/admin/perks/[id] - Obtener un perk
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const perk = await db.user.findUnique({
      where: { id: params.id }
    });

    if (!perk || perk.type !== 'perk') {
      return NextResponse.json(
        { error: 'Perk no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(perk);
  } catch (error) {
    console.error('Error al obtener perk:', error);
    return NextResponse.json(
      { error: 'Error al obtener el perk' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/perks/[id] - Actualizar un perk
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, type, price } = body;

    const updatedPerk = await db.user.update({
      where: { id: params.id },
      data: {
        name,
        description,
        type,
        price
      }
    });

    return NextResponse.json(updatedPerk);
  } catch (error) {
    console.error('Error al actualizar perk:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el perk' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/perks/[id] - Eliminar un perk
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    await db.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Perk eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar perk:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el perk' },
      { status: 500 }
    );
  }
} 
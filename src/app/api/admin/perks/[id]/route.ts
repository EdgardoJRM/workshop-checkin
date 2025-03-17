import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT /api/admin/perks/[id] - Actualizar un perk
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const data = await request.json();
    const perkIndex = perks.findIndex(p => p.id === params.id);
    
    if (perkIndex === -1) {
      return new NextResponse('Perk not found', { status: 404 });
    }

    perks[perkIndex] = {
      ...perks[perkIndex],
      name: data.name,
      description: data.description,
      type: data.type
    };

    return NextResponse.json(perks[perkIndex]);
  } catch (error) {
    return new NextResponse('Error updating perk', { status: 500 });
  }
}

// DELETE /api/admin/perks/[id] - Eliminar un perk
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const perkIndex = perks.findIndex(p => p.id === params.id);
    
    if (perkIndex === -1) {
      return new NextResponse('Perk not found', { status: 404 });
    }

    perks.splice(perkIndex, 1);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse('Error deleting perk', { status: 500 });
  }
} 
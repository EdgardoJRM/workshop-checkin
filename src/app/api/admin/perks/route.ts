import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Simulated perks data since we don't have a Perk model yet
const perks = [
  {
    id: 'material-digital',
    name: 'Material Digital',
    description: 'Acceso a todos los materiales en formato digital',
    type: 'digital',
    _count: { users: 56 }
  },
  {
    id: 'material-impreso',
    name: 'Material Impreso',
    description: 'Acceso a todos los materiales impresos',
    type: 'physical',
    _count: { users: 23 }
  },
  {
    id: 'videos-extra',
    name: 'Videos Extra',
    description: 'Acceso a videos adicionales del taller',
    type: 'access',
    _count: { users: 14 }
  },
  {
    id: 'certificado',
    name: 'Certificado',
    description: 'Certificado de participación en el taller',
    type: 'certificate',
    _count: { users: 42 }
  }
];

// GET /api/admin/perks - Obtener todos los perks
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const perks = await db.perk.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get user counts for each perk
    const perksWithCounts = await Promise.all(
      perks.map(async (perk) => {
        const users = await db.user.findMany();
        const userCount = users.filter(user => 
          user.perks?.includes(perk.id)
        ).length;

        return {
          ...perk,
          _count: {
            users: userCount
          }
        };
      })
    );

    return NextResponse.json(perksWithCounts);
  } catch (error) {
    console.error('Error fetching perks:', error);
    return NextResponse.json(
      { error: 'Error al cargar perks' },
      { status: 500 }
    );
  }
}

// POST /api/admin/perks - Crear un nuevo perk
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { name, description, type, price } = data;

    const perk = await db.perk.create({
      name,
      description,
      type,
      price,
      contents: []
    });

    return NextResponse.json({
      ...perk,
      _count: { users: 0 }
    });
  } catch (error) {
    console.error('Error creating perk:', error);
    return NextResponse.json(
      { error: 'Error al crear perk' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/perks/[id] - Actualizar un perk
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { name, description, type, price } = data;

    const perk = await db.perk.update({
      where: { id: params.id },
      data: {
        name,
        description,
        type,
        price
      }
    });

    if (!perk) {
      return NextResponse.json(
        { error: 'Perk no encontrado' },
        { status: 404 }
      );
    }

    const users = await db.user.findMany();
    const userCount = users.filter(user => 
      user.perks?.includes(perk.id)
    ).length;

    return NextResponse.json({
      ...perk,
      _count: { users: userCount }
    });
  } catch (error) {
    console.error('Error updating perk:', error);
    return NextResponse.json(
      { error: 'Error al actualizar perk' },
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
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const perk = await db.perk.delete({
      where: { id: params.id }
    });

    if (!perk) {
      return NextResponse.json(
        { error: 'Perk no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Perk eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting perk:', error);
    return NextResponse.json(
      { error: 'Error al eliminar perk' },
      { status: 500 }
    );
  }
} 
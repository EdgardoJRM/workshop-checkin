import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.json(perks);
}

// POST /api/admin/perks - Crear un nuevo perk
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const data = await request.json();
    const newPerk = {
      id: String(perks.length + 1),
      name: data.name,
      description: data.description,
      type: data.type,
      _count: { users: 0 }
    };

    perks.push(newPerk);
    return NextResponse.json(newPerk);
  } catch (error) {
    return new NextResponse('Error creating perk', { status: 500 });
  }
}

// PUT /api/admin/perks - Actualizar un perk
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const data = await request.json();
    const perkIndex = perks.findIndex(p => p.id === data.id);
    
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

// DELETE /api/admin/perks - Eliminar un perk
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Missing perk ID', { status: 400 });
    }

    const perkIndex = perks.findIndex(p => p.id === id);
    
    if (perkIndex === -1) {
      return new NextResponse('Perk not found', { status: 404 });
    }

    perks.splice(perkIndex, 1);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse('Error deleting perk', { status: 500 });
  }
} 
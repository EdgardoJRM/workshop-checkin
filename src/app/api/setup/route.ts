import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // Verificar si ya existe un usuario administrador
    const users = await db.user.findMany();
    const adminExists = users.some(user => user.role === 'admin');

    if (adminExists) {
      return NextResponse.json(
        { error: 'Ya existe un usuario administrador' },
        { status: 400 }
      );
    }

    // Crear usuario administrador
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await db.user.create({
      id: Date.now().toString(),
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
      perks: [],
      eventAccess: [],
      isActive: true,
      type: 'user'
    });

    // Eliminar el password del objeto de respuesta
    const { password: _, ...userWithoutPassword } = adminUser;

    return NextResponse.json({
      message: 'Configuración inicial completada',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error en configuración inicial:', error);
    return NextResponse.json(
      { error: 'Error al realizar la configuración inicial' },
      { status: 500 }
    );
  }
} 
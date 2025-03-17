import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Ya existe un usuario administrador' },
        { status: 400 }
      );
    }

    // Crear usuario admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Administrador',
        role: 'admin',
        isActive: true
      }
    });

    return NextResponse.json({
      message: 'Usuario administrador creado exitosamente',
      email: admin.email
    });
  } catch (error) {
    console.error('Error en setup:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario administrador' },
      { status: 500 }
    );
  }
} 
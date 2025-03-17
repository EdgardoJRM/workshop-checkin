import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { db } from '@/lib/awsConfig';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

export async function GET() {
  try {
    // Obtener token de las cookies de forma asíncrona
    const cookieStore = cookies();
    const token = await cookieStore.get('next-auth.session-token');

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar token usando el secreto correcto
    const payload = verify(token.value, process.env.NEXTAUTH_SECRET || '') as {
      email: string;
    };

    // Obtener datos del usuario
    const queryParams = new QueryCommand({
      TableName: process.env.USER_TABLE || 'Usuarios',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': payload.email,
      },
      Limit: 1,
    });

    const result = await db.send(queryParams);

    if (!result.Items || result.Items.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const user = result.Items[0];

    // Remove sensitive fields without creating unused variables
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return NextResponse.json(
      { error: 'Error al obtener información de perfil' },
      { status: 500 }
    );
  }
} 
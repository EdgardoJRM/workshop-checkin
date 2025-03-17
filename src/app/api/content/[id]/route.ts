import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { db } from '@/lib/awsConfig';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const contentId = params.id;

    // Obtener token de las cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar token
    const payload = verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as {
      email: string;
    };

    // Obtener datos del usuario para verificar acceso
    const userQueryParams = new QueryCommand({
      TableName: 'Usuarios',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': payload.email,
      },
      Limit: 1,
    });

    const userResult = await db.send(userQueryParams);

    if (!userResult.Items || userResult.Items.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const user = userResult.Items[0];

    // Verificar si el usuario tiene acceso al contenido
    if (!user.eventAccess || !user.eventAccess.includes(contentId)) {
      // Para demostraciones, si no hay contenido real, devolver uno de ejemplo
      const demoContent = {
        id: contentId,
        title: 'Documento de ejemplo',
        type: 'images',
        images: [
          // Imágenes de ejemplo (reemplazar con tus propias URLs)
          'https://placehold.co/800x1000/jpg?text=Ejemplo+Página+1',
          'https://placehold.co/800x1000/jpg?text=Ejemplo+Página+2',
          'https://placehold.co/800x1000/jpg?text=Ejemplo+Página+3',
        ],
        accessLevel: 'free',
        eventId: 'demo-event',
        description: 'Este es un documento de ejemplo para propósitos de demostración.',
      };
      
      return NextResponse.json({
        success: true,
        content: demoContent,
        demo: true
      });
    }

    // En una implementación real, buscarías estas imágenes en tu base de datos o S3
    // Para este ejemplo, devolvemos contenido de demostración con imágenes
    const content = {
      id: contentId,
      title: 'Documento del evento',
      type: 'images',
      images: [
        // Aquí irían las URLs reales de las imágenes del documento
        'https://placehold.co/800x1000/jpg?text=Página+1',
        'https://placehold.co/800x1000/jpg?text=Página+2',
        'https://placehold.co/800x1000/jpg?text=Página+3',
        'https://placehold.co/800x1000/jpg?text=Página+4',
        'https://placehold.co/800x1000/jpg?text=Página+5',
      ],
      accessLevel: user.perks?.includes('premium') ? 'premium' : 'free',
      eventId: contentId,
    };

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error('Error al obtener contenido:', error);
    return NextResponse.json(
      { error: 'Error al obtener contenido', details: error },
      { status: 500 }
    );
  }
} 
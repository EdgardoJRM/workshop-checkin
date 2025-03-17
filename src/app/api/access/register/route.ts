import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, USER_TABLE } from '@/lib/awsConfig';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const data = await request.json();
    
    if (!data.eventId) {
      return new NextResponse('Event ID is required', { status: 400 });
    }

    // Verificar si el usuario está registrado para el evento
    const eventQuery = new QueryCommand({
      TableName: USER_TABLE,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': 'EVENT',
        ':sk': `UPCOMING#${data.eventId}`,
      },
    });

    const eventResult = await db.send(eventQuery);
    const event = eventResult.Items?.[0];

    if (!event) {
      return new NextResponse('Event not found', { status: 404 });
    }

    // Verificar si el usuario ya está registrado
    const isRegistered = event.attendees?.includes(session.user.id);
    const isAllowed = isRegistered && event.date > new Date().toISOString();

    // Registrar el acceso
    const accessLog = {
      PK: 'ACCESS',
      SK: `LOG#${uuidv4()}`,
      userId: session.user.id,
      eventId: data.eventId,
      timestamp: new Date().toISOString(),
      status: isAllowed ? 'success' : 'denied',
      eventName: event.name,
    };

    const putCommand = new PutCommand({
      TableName: USER_TABLE,
      Item: accessLog,
    });

    await db.send(putCommand);

    if (!isAllowed) {
      return new NextResponse('Access denied', { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: 'Access granted',
      accessLog
    });
  } catch (error) {
    console.error('Error registering access:', error);
    return new NextResponse('Error registering access', { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 10;
    
    // Obtener logs de acceso del usuario
    const queryParams = new QueryCommand({
      TableName: USER_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':pk': 'ACCESS',
        ':sk': 'LOG#',
        ':userId': session.user.id,
      },
      Limit: limit,
      ScanIndexForward: false, // Ordenar por fecha descendente
    });

    const result = await db.send(queryParams);

    if (!result.Items) {
      return NextResponse.json([]);
    }

    // Transformar los items de DynamoDB al formato esperado por el frontend
    const accessLogs = result.Items.map(item => ({
      id: item.SK.split('#')[1],
      eventId: item.eventId,
      timestamp: item.timestamp,
      status: item.status,
      eventName: item.eventName,
    }));

    return NextResponse.json(accessLogs);
  } catch (error) {
    console.error('Error fetching access logs:', error);
    return new NextResponse('Error fetching access logs', { status: 500 });
  }
} 
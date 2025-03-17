import { NextResponse } from 'next/server';
import { db, USER_TABLE } from '@/lib/awsConfig';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 5;
    
    // Obtener eventos próximos de DynamoDB
    const queryParams = new QueryCommand({
      TableName: USER_TABLE,
      KeyConditionExpression: 'PK = :pk',
      FilterExpression: 'begins_with(SK, :sk) AND #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':pk': 'EVENT',
        ':sk': 'UPCOMING#',
        ':status': 'UPCOMING'
      },
      Limit: limit,
      ScanIndexForward: true, // Ordenar por fecha ascendente
    });

    const result = await db.send(queryParams);

    if (!result.Items) {
      return NextResponse.json([]);
    }

    // Transformar los items de DynamoDB al formato esperado por el frontend
    const upcomingEvents = result.Items.map(item => ({
      id: item.SK.split('#')[1],
      name: item.name,
      description: item.description,
      date: item.date,
      location: item.location,
      capacity: item.capacity,
      _count: {
        attendees: item.attendeeCount || 0
      }
    }));

    return NextResponse.json(upcomingEvents);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return NextResponse.json(
      { error: 'Error al obtener eventos próximos' },
      { status: 500 }
    );
  }
} 
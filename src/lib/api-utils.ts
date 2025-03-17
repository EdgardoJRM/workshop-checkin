import { NextResponse } from 'next/server';

export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  // Asegurarse de que siempre devolvemos una respuesta JSON
  return new NextResponse(
    JSON.stringify({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }),
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
} 
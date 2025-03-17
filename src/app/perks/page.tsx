'use client';

import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import type { Content } from '@/lib/db';

interface Perk {
  id: string;
  name: string;
  description: string;
  type: string;
  contents: Content[];
}

export default function PerksPage() {
  const { data: session, status } = useSession();
  const [perks, setPerks] = useState<Perk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
      return;
    }

    const fetchPerks = async () => {
      try {
        const response = await fetch('/api/perks');
        if (!response.ok) {
          throw new Error('Error al cargar perks');
        }
        const data = await response.json();
        setPerks(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchPerks();
    }
  }, [session, status]);

  if (status === 'loading' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mis Perks</h1>
        <p className="mt-2 text-gray-600">
          Accede a tus beneficios exclusivos
        </p>
      </div>

      {error && (
        <Card className="mb-6 p-4">
          <p className="text-center text-red-600">{error}</p>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            </Card>
          ))
        ) : perks.length > 0 ? (
          perks.map((perk) => (
            <Card key={perk.id} className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{perk.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {perk.description}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/perks/${perk.id}`}
                  >
                    Ver Contenido
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-6">
            <p className="text-center text-gray-600">
              No tienes perks disponibles
            </p>
          </Card>
        )}
      </div>
    </div>
  );
} 
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PerkForm from '@/components/admin/PerkForm';
import type { Perk } from '@/lib/db';

export default function PerksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [perks, setPerks] = useState<Perk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPerk, setEditingPerk] = useState<Perk | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchPerks = async () => {
      try {
        const response = await fetch('/api/admin/perks');
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
  }, [session, status, router]);

  const handleSubmit = async (perk: Perk) => {
    try {
      const response = await fetch('/api/admin/perks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(perk),
      });

      if (!response.ok) {
        throw new Error('Error al crear perk');
      }

      const newPerk = await response.json();
      setPerks([newPerk, ...perks]);
      setShowForm(false);
      setEditingPerk(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este perk?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/perks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar perk');
      }

      setPerks(perks.filter((perk) => perk.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  if (status === 'loading' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Perks</h1>
          <p className="mt-2 text-gray-600">
            Gestiona los beneficios disponibles
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Perk
        </Button>
      </div>

      {error && (
        <Card className="mb-6 p-4">
          <p className="text-center text-red-600">{error}</p>
        </Card>
      )}

      {showForm && (
        <Card className="mb-6 p-6">
          <PerkForm
            initialPerk={editingPerk}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingPerk(null);
            }}
          />
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {perk._count?.users || 0} usuarios
                  </span>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPerk(perk);
                        setShowForm(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(perk.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-6">
            <p className="text-center text-gray-600">
              No hay perks disponibles
            </p>
          </Card>
        )}
      </div>
    </div>
  );
} 
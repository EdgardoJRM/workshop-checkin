'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/shared/Modal';
import PerkForm from '@/components/admin/PerkForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface Perk {
  id: string;
  name: string;
  description: string;
  type: string;
  _count: {
    users: number;
  };
}

// Sample perks (in a real implementation, these would come from an API)
const samplePerks: Perk[] = [
  {
    id: 'material-digital',
    name: 'Material Digital',
    description: 'Acceso a todos los materiales en formato digital',
    type: 'digital',
    _count: {
      users: 56,
    },
  },
  {
    id: 'material-impreso',
    name: 'Material Impreso',
    description: 'Acceso a todos los materiales impresos',
    type: 'impreso',
    _count: {
      users: 23,
    },
  },
  {
    id: 'videos-extra',
    name: 'Videos Extra',
    description: 'Acceso a videos adicionales del taller',
    type: 'access',
    _count: {
      users: 14,
    },
  },
  {
    id: 'certificado',
    name: 'Certificado',
    description: 'Certificado de participación en el taller',
    type: 'certificate',
    _count: {
      users: 42,
    },
  },
];

export default function PerksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [perks, setPerks] = useState<Perk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, router, session]);

  useEffect(() => {
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

    if (session?.user.role === 'admin') {
      fetchPerks();
    }
  }, [session]);

  const handleCreatePerk = async (data: Omit<Perk, 'id'>) => {
    try {
      const response = await fetch('/api/admin/perks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear el perk');
      }

      const newPerk = await response.json();
      setPerks([...perks, newPerk]);
      setShowCreateForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleEditPerk = async (data: Perk) => {
    try {
      const response = await fetch(`/api/admin/perks/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el perk');
      }

      const updatedPerk = await response.json();
      setPerks(perks.map(perk => 
        perk.id === updatedPerk.id ? updatedPerk : perk
      ));
      setSelectedPerk(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleDeletePerk = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este perk?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/perks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el perk');
      }

      setPerks(perks.filter(perk => perk.id !== id));
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

  if (session.user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Acceso Denegado</h2>
            <p className="mt-2 text-gray-600">
              No tienes permisos para acceder a esta página
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="mt-6"
              variant="outline"
            >
              Volver al Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gestión de Perks</h1>
        <p className="mt-2 text-gray-600">
          Administra los perks y beneficios disponibles
        </p>
      </div>

      <div className="mb-6">
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Perk
        </Button>
      </div>

      {error && (
        <Card className="mb-6 p-4">
          <p className="text-center text-red-600">{error}</p>
        </Card>
      )}

      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Crear Nuevo Perk"
      >
        <PerkForm
          onSubmit={handleCreatePerk}
          onCancel={() => setShowCreateForm(false)}
        />
      </Modal>

      <Modal
        isOpen={selectedPerk !== null}
        onClose={() => setSelectedPerk(null)}
        title="Editar Perk"
      >
        {selectedPerk && (
          <PerkForm
            initialData={selectedPerk}
            onSubmit={handleEditPerk}
            onCancel={() => setSelectedPerk(null)}
          />
        )}
      </Modal>

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
                    {perk._count.users} usuarios
                  </span>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPerk(perk)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePerk(perk.id)}
                    >
                      Eliminar
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
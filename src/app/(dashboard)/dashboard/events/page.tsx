'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, MapPin, Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Modal from '@/components/shared/Modal';
import EventForm from '@/components/admin/EventForm';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  capacity: number | null;
  _count?: {
    attendees: number;
  };
}

export default function EventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, router, session]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/admin/events');
        if (!response.ok) {
          throw new Error('Error al cargar eventos');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user.role === 'admin') {
      fetchEvents();
    }
  }, [session]);

  const handleCreateEvent = async (event: Event) => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Error al crear el evento');
      }

      const newEvent = await response.json();
      setEvents([...events, newEvent]);
      setShowCreateForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleEditEvent = async (event: Event) => {
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el evento');
      }

      const updatedEvent = await response.json();
      setEvents(events.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      setSelectedEvent(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el evento');
      }

      setEvents(events.filter(event => event.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
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
        <h1 className="text-2xl font-bold">Gestión de Eventos</h1>
        <p className="mt-2 text-gray-600">
          Administra los eventos y talleres disponibles
        </p>
      </div>

      <div className="mb-6">
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-center text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardHeader className="space-y-2">
                <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id} className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-bold">{event.name}</CardTitle>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span>{formatEventDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5" />
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {event._count?.attendees || 0} / {event.capacity || 'N/A'}
                    </Badge>
                    <span className="text-sm">asistentes</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEvent(event)}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteEvent(event.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">No hay eventos disponibles</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Crear Evento"
      >
        <EventForm
          onSubmit={handleCreateEvent}
          onCancel={() => setShowCreateForm(false)}
        />
      </Modal>

      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Editar Evento"
      >
        {selectedEvent && (
          <EventForm
            initialEvent={selectedEvent}
            onSubmit={handleEditEvent}
            onCancel={() => setSelectedEvent(null)}
          />
        )}
      </Modal>
    </div>
  );
} 
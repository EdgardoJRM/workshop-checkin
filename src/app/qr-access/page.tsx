"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, MapPin, Users, CheckCircle2, XCircle } from 'lucide-react';
import LogoutButton from '@/components/shared/LogoutButton';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  _count: {
    attendees: number;
  };
}

interface AccessLog {
  id: string;
  eventId: string;
  timestamp: string;
  status: 'success' | 'denied';
}

export default function QRAccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, logsRes] = await Promise.all([
          fetch('/api/events/upcoming'),
          fetch('/api/access/register')
        ]);

        if (eventsRes.ok && logsRes.ok) {
          const [events, logs] = await Promise.all([
            eventsRes.json(),
            logsRes.json()
          ]);

          setUpcomingEvents(events);
          setAccessLogs(logs);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Acceso QR</h1>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="space-y-6">
            <Card className="backdrop-blur-lg bg-white/10 border-white/20 p-6">
              <h2 className="mb-4 text-2xl font-bold text-white">Tu Código QR</h2>
              <div className="flex justify-center bg-white p-4 rounded-lg">
                <QRCode
                  value={JSON.stringify({
                    userId: session.user.id,
                    email: session.user.email,
                    name: session.user.name
                  })}
                  size={200}
                />
              </div>
              <p className="mt-4 text-center text-sm text-blue-200">
                Muestra este código para registrar tu asistencia
              </p>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => router.push('/materials')}
              >
                Materiales
              </Button>
              <Button
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => router.push('/user/profile')}
              >
                Perfil
              </Button>
            </div>
          </div>

          {/* Events and History Section */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card className="backdrop-blur-lg bg-white/10 border-white/20 p-6">
              <h2 className="mb-4 text-2xl font-bold text-white">Próximos Eventos</h2>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 rounded-lg bg-white/5" />
                  ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                    >
                      <h3 className="font-semibold text-white">{event.name}</h3>
                      <div className="mt-2 space-y-1 text-blue-200">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(event.date).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {event._count.attendees} / {event.capacity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-blue-200">
                  No hay eventos próximos
                </p>
              )}
            </Card>

            {/* Access History */}
            <Card className="backdrop-blur-lg bg-white/10 border-white/20 p-6">
              <h2 className="mb-4 text-2xl font-bold text-white">Historial de Acceso</h2>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-white/5" />
                  ))}
                </div>
              ) : accessLogs.length > 0 ? (
                <div className="space-y-4">
                  {accessLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                    >
                      <div>
                        <p className="font-medium text-white">Evento #{log.eventId}</p>
                        <p className="text-sm text-blue-200">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          log.status === 'success'
                            ? 'bg-green-500/20 text-green-200'
                            : 'bg-red-500/20 text-red-200'
                        }`}
                      >
                        {log.status === 'success' ? 'Exitoso' : 'Denegado'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-blue-200">
                  No hay registros de acceso
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 
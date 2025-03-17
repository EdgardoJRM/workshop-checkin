import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, MapPin } from 'lucide-react';

interface AccessLog {
  id: string;
  timestamp: string;
  event: {
    name: string;
    location: string;
  };
}

export function AccessHistory() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/user/access-logs');
        if (!response.ok) {
          throw new Error('Error al cargar el historial');
        }
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-xl p-6 border border-white/20">
      <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200 mb-4">
        Historial de Accesos
      </h3>
      <ScrollArea className="h-[400px] pr-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-200"></div>
          </div>
        ) : error ? (
          <div className="text-red-300 text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center text-gray-300 p-8 bg-white/5 rounded-lg border border-white/10">
            <p className="text-lg mb-2">No hay registros de acceso</p>
            <p className="text-sm">Los accesos a eventos aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <h4 className="font-medium text-white">{log.event.name}</h4>
                <div className="mt-2 flex items-center text-sm text-gray-300 space-x-4">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(log.timestamp)}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {log.event.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 
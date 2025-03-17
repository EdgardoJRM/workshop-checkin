'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  capacity: number | null;
}

interface EventFormProps {
  initialEvent?: Event;
  onSubmit: (event: Event) => Promise<void>;
  onCancel: () => void;
}

export default function EventForm({ initialEvent, onSubmit, onCancel }: EventFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState(initialEvent?.name || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [date, setDate] = useState(initialEvent?.date || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [capacity, setCapacity] = useState<number | null>(initialEvent?.capacity || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await onSubmit({
        id: initialEvent?.id || '',
        name,
        description,
        date,
        location,
        capacity
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el evento');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-lg text-red-600 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Evento</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Taller de Desarrollo Web"
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe el evento y sus objetivos..."
          className="min-h-[100px] w-full"
          rows={4}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            Fecha y Hora
          </Label>
          <Input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity" className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            Capacidad
          </Label>
          <Input
            id="capacity"
            type="number"
            value={capacity || ''}
            onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value) : null)}
            placeholder="Ej: 30"
            className="w-full"
            min="1"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          Ubicación
        </Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej: Sala de Conferencias A"
          className="w-full"
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
} 
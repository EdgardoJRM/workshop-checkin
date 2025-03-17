'use client';

import { useState, useEffect } from 'react';
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
  capacity: number;
}

interface EventFormProps {
  event?: Event | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    capacity: ''
  });

  useEffect(() => {
    if (event) {
      const date = new Date(event.date);
      const formattedDate = date.toISOString().slice(0, 16); // Format: "YYYY-MM-DDThh:mm"
      
      setFormData({
        name: event.name,
        description: event.description || '',
        date: formattedDate,
        location: event.location,
        capacity: event.capacity.toString()
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      capacity: parseInt(formData.capacity),
      ...(event && { id: event.id })
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Evento</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Taller de Desarrollo Web"
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
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
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
        <Button type="submit">
          {event ? 'Actualizar' : 'Crear'} Evento
        </Button>
      </div>
    </form>
  );
} 
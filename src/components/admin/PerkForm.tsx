'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

interface Perk {
  id: string;
  name: string;
  description: string;
  type: 'basic' | 'premium' | 'vip';
  price: number;
  contents: Content[];
}

interface Content {
  id: string;
  type: 'ebook' | 'calculator' | 'certificate' | 'course' | 'tool';
  name: string;
  url: string;
  isProtected: boolean;
  accessUrl?: string;
}

interface PerkFormProps {
  initialPerk?: Perk;
  onSubmit: (perk: Perk) => Promise<void>;
  onCancel: () => void;
}

export default function PerkForm({ initialPerk, onSubmit, onCancel }: PerkFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState(initialPerk?.name || '');
  const [description, setDescription] = useState(initialPerk?.description || '');
  const [type, setType] = useState<'basic' | 'premium' | 'vip'>(initialPerk?.type || 'basic');
  const [price, setPrice] = useState(initialPerk?.price || 0);
  const [contents, setContents] = useState<Content[]>(initialPerk?.contents || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await onSubmit({
        id: initialPerk?.id || '',
        name,
        description,
        type,
        price,
        contents
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el perk');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Tipo</Label>
          <Select value={type} onValueChange={(value) => setType(value as 'basic' | 'premium' | 'vip')}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Básico</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="space-y-4">
          <Label>Contenidos</Label>
          {contents.map((content, index) => (
            <Card key={content.id || index} className="p-4 space-y-4">
              <div>
                <Label>Nombre del contenido</Label>
                <Input
                  value={content.name}
                  onChange={(e) => {
                    const newContents = [...contents];
                    newContents[index] = { ...content, name: e.target.value };
                    setContents(newContents);
                  }}
                  required
                />
              </div>

              <div>
                <Label>Tipo de contenido</Label>
                <Select 
                  value={content.type}
                  onValueChange={(value) => {
                    const newContents = [...contents];
                    newContents[index] = { ...content, type: value as Content['type'] };
                    setContents(newContents);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ebook">eBook</SelectItem>
                    <SelectItem value="calculator">Calculadora</SelectItem>
                    <SelectItem value="certificate">Certificado</SelectItem>
                    <SelectItem value="course">Curso</SelectItem>
                    <SelectItem value="tool">Herramienta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>URL del contenido</Label>
                <Input
                  type="url"
                  value={content.url}
                  onChange={(e) => {
                    const newContents = [...contents];
                    newContents[index] = { ...content, url: e.target.value };
                    setContents(newContents);
                  }}
                  required
                />
              </div>

              <div>
                <Label>URL de acceso (opcional)</Label>
                <Input
                  type="url"
                  value={content.accessUrl || ''}
                  onChange={(e) => {
                    const newContents = [...contents];
                    newContents[index] = { ...content, accessUrl: e.target.value };
                    setContents(newContents);
                  }}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`protected-${index}`}
                  checked={content.isProtected}
                  onCheckedChange={(checked) => {
                    const newContents = [...contents];
                    newContents[index] = { ...content, isProtected: checked as boolean };
                    setContents(newContents);
                  }}
                />
                <Label htmlFor={`protected-${index}`}>Contenido protegido</Label>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newContents = contents.filter((_, i) => i !== index);
                  setContents(newContents);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Eliminar contenido
              </Button>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const newContent: Content = {
                id: '',
                type: 'ebook',
                name: '',
                url: '',
                isProtected: false
              };
              setContents([...contents, newContent]);
            }}
            className="w-full"
          >
            Agregar contenido
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
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
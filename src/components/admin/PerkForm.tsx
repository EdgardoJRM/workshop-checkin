'use client';

import { useState } from 'react';
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
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface PerkFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
    type: string;
    resourceUrl?: string;
    externalCourseUrl?: string;
    certificateUrl?: string;
    validFrom?: string;
    validUntil?: string;
    isDownloadable?: boolean;
    hasPhysicalDelivery?: boolean;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function PerkForm({ initialData, onSubmit, onCancel }: PerkFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'digital',
    resourceUrl: initialData?.resourceUrl || '',
    externalCourseUrl: initialData?.externalCourseUrl || '',
    certificateUrl: initialData?.certificateUrl || '',
    validFrom: initialData?.validFrom || '',
    validUntil: initialData?.validUntil || '',
    isDownloadable: initialData?.isDownloadable || false,
    hasPhysicalDelivery: initialData?.hasPhysicalDelivery || false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({
        id: initialData?.id,
        ...formData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el perk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Card className="p-4 bg-destructive/10 text-destructive">
          {error}
        </Card>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ebook">eBook</SelectItem>
            <SelectItem value="course">Curso Externo</SelectItem>
            <SelectItem value="certificate">Certificado</SelectItem>
            <SelectItem value="physical">Material Físico</SelectItem>
            <SelectItem value="digital">Material Digital</SelectItem>
            <SelectItem value="access">Acceso Especial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type === 'ebook' && (
        <div className="space-y-2">
          <Label htmlFor="resourceUrl">URL del eBook</Label>
          <Input
            id="resourceUrl"
            type="url"
            value={formData.resourceUrl}
            onChange={(e) => setFormData({ ...formData, resourceUrl: e.target.value })}
            placeholder="https://ejemplo.com/ebook.pdf"
          />
        </div>
      )}

      {formData.type === 'course' && (
        <div className="space-y-2">
          <Label htmlFor="externalCourseUrl">URL del Curso Externo</Label>
          <Input
            id="externalCourseUrl"
            type="url"
            value={formData.externalCourseUrl}
            onChange={(e) => setFormData({ ...formData, externalCourseUrl: e.target.value })}
            placeholder="https://plataforma.com/curso"
          />
        </div>
      )}

      {formData.type === 'certificate' && (
        <div className="space-y-2">
          <Label htmlFor="certificateUrl">URL del Certificado</Label>
          <Input
            id="certificateUrl"
            type="url"
            value={formData.certificateUrl}
            onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
            placeholder="https://ejemplo.com/certificado"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validFrom">Válido Desde</Label>
          <Input
            id="validFrom"
            type="date"
            value={formData.validFrom}
            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="validUntil">Válido Hasta</Label>
          <Input
            id="validUntil"
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isDownloadable"
            checked={formData.isDownloadable}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, isDownloadable: checked as boolean })
            }
          />
          <Label htmlFor="isDownloadable">Permite Descarga</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasPhysicalDelivery"
            checked={formData.hasPhysicalDelivery}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, hasPhysicalDelivery: checked as boolean })
            }
          />
          <Label htmlFor="hasPhysicalDelivery">Requiere Entrega Física</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
} 
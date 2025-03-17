'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/admin/DashboardLayout';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  perks: string[];
  eventAccess: string[];
  isActive: boolean;
  createdAt?: string;
}

interface UserEditFormProps {
  initialUser: User;
}

export default function UserEditForm({ initialUser }: UserEditFormProps) {
  const router = useRouter();
  const [user, setUser] = useState<User>(initialUser);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [currentRole, setCurrentRole] = useState(initialUser.role);
  const [currentPerks, setCurrentPerks] = useState<string[]>(initialUser.perks);
  const [currentEventAccess, setCurrentEventAccess] = useState<string[]>(initialUser.eventAccess);
  const [currentName, setCurrentName] = useState(initialUser.name);
  const [currentActive, setCurrentActive] = useState(initialUser.isActive);
  
  // Opciones disponibles (en un sistema real, estas vendrían de la base de datos)
  const availablePerks = ['material-digital', 'material-impreso', 'videos-extra', 'certificado'];
  const availableEvents = ['workshop-2024', 'conferencia-enero', 'webinar-febrero'];
  
  // Función para guardar cambios
  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: currentName,
          role: currentRole,
          perks: currentPerks,
          eventAccess: currentEventAccess,
          isActive: currentActive,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar usuario');
      }
      
      setSuccess('Usuario actualizado correctamente');
      // Actualizar datos del usuario
      const updatedUser = await res.json();
      setUser(updatedUser);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  };
  
  // Función para eliminar usuario
  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar usuario');
      }
      
      // Redirigir a la lista de usuarios
      router.push('/dashboard/users');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
      setSaving(false);
    }
  };
  
  // Función para manejar los cambios en perks
  const handlePerkChange = (perk: string) => {
    if (currentPerks.includes(perk)) {
      setCurrentPerks(currentPerks.filter(p => p !== perk));
    } else {
      setCurrentPerks([...currentPerks, perk]);
    }
  };
  
  // Función para manejar los cambios en eventAccess
  const handleEventChange = (event: string) => {
    if (currentEventAccess.includes(event)) {
      setCurrentEventAccess(currentEventAccess.filter(e => e !== event));
    } else {
      setCurrentEventAccess([...currentEventAccess, event]);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Editar Usuario</h1>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => router.push('/dashboard/users')}
          >
            Volver a Lista
          </button>
        </div>
        
        {error && !success ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-600 mb-4">
            {error}
          </div>
        ) : (
          <>
            {success && (
              <div className="bg-green-50 p-4 rounded-lg text-green-600 mb-4">
                {success}
              </div>
            )}
            
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Información General</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                      type="text" 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100" 
                      value={user.email} 
                      readOnly 
                    />
                    <p className="text-xs text-gray-500 mt-1">El email no puede ser modificado</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input 
                      type="text" 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
                      value={currentName} 
                      onChange={(e) => setCurrentName(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Roles y Permisos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rol</label>
                    <select 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                    >
                      <option value="user">Usuario</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <div className="mt-2">
                      <label className="inline-flex items-center">
                        <input 
                          type="checkbox" 
                          className="form-checkbox h-5 w-5 text-blue-600" 
                          checked={currentActive} 
                          onChange={(e) => setCurrentActive(e.target.checked)} 
                        />
                        <span className="ml-2">Activo</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Perks</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {availablePerks.map(perk => (
                    <div key={perk} className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`perk-${perk}`} 
                        className="form-checkbox h-5 w-5 text-blue-600" 
                        checked={currentPerks.includes(perk)} 
                        onChange={() => handlePerkChange(perk)} 
                      />
                      <label htmlFor={`perk-${perk}`} className="ml-2 text-sm text-gray-700">
                        {perk}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Acceso a Eventos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableEvents.map(event => (
                    <div key={event} className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`event-${event}`} 
                        className="form-checkbox h-5 w-5 text-blue-600" 
                        checked={currentEventAccess.includes(event)} 
                        onChange={() => handleEventChange(event)} 
                      />
                      <label htmlFor={`event-${event}`} className="ml-2 text-sm text-gray-700">
                        {event}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between pt-4 border-t">
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300"
                  onClick={handleDelete}
                  disabled={saving || user.role === 'admin'}
                >
                  Eliminar Usuario
                </button>
                <button 
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 
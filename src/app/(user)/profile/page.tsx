'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/shared/LogoutButton';

interface UserProfile {
  email: string;
  name: string;
  role: string;
  perks: string[];
  eventAccess: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile');
        
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Error al cargar perfil');
        }

        const data = await res.json();
        setProfile(data.user);
      } catch (err) {
        setError('Error al cargar información de perfil');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-center mb-4">{error}</div>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Información de perfil */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
                <div className="mt-5">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nombre</p>
                      <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                      <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Eventos */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Mis Eventos</h3>
                <div className="mt-5">
                  {profile.eventAccess && profile.eventAccess.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {profile.eventAccess.map((event, index) => (
                        <li key={index} className="py-3">
                          <Link href={`/content/${event}`} className="text-indigo-600 hover:text-indigo-900">
                            {event}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No tienes eventos activos</p>
                  )}
                </div>
              </div>
            </div>

            {/* Perks */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Mis Beneficios</h3>
                <div className="mt-5">
                  {profile.perks && profile.perks.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {profile.perks.map((perk, index) => (
                        <li key={index} className="py-3">
                          <span className="text-sm text-gray-900">{perk}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No tienes beneficios activos</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 
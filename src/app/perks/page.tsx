'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedContent from '@/components/shared/ProtectedContent';
import type { Perk } from '@/lib/db';

export default function UserPerksPage() {
  const router = useRouter();
  const [perks, setPerks] = useState<Perk[]>([]);
  const [selectedContent, setSelectedContent] = useState<{
    url: string;
    type: 'pdf' | 'ebook' | 'calculator';
    title: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerks = async () => {
      try {
        const response = await fetch('/api/user/perks');
        if (!response.ok) throw new Error('Error al cargar perks');
        const data = await response.json();
        setPerks(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark-theme">
        <p>Cargando tus materiales...</p>
      </div>
    );
  }

  if (selectedContent) {
    return (
      <div className="min-h-screen dark-theme">
        <div className="container mx-auto py-8">
          <button
            onClick={() => setSelectedContent(null)}
            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ← Volver a mis materiales
          </button>
          
          <ProtectedContent {...selectedContent} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark-theme">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Mis Materiales</h1>

        {perks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 mb-4">Aún no tienes acceso a ningún material.</p>
            <p className="text-gray-500">
              Contacta con el administrador si crees que esto es un error.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((perk) => (
              <div key={perk.id} className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">{perk.name}</h2>
                <p className="text-gray-400 mb-4">{perk.description}</p>
                
                <div className="space-y-4">
                  {perk.contents.map((content, index) => (
                    <div 
                      key={index}
                      className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => {
                        if (content.accessUrl) {
                          window.open(content.accessUrl, '_blank');
                        } else {
                          setSelectedContent({
                            url: content.url,
                            type: content.type as any,
                            title: content.name
                          });
                        }
                      }}
                    >
                      <div className="flex items-center">
                        {/* Icono según el tipo de contenido */}
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          {content.type === 'ebook' && '📚'}
                          {content.type === 'calculator' && '🧮'}
                          {content.type === 'certificate' && '🎓'}
                          {content.type === 'course' && '📺'}
                          {content.type === 'tool' && '🛠️'}
                        </div>
                        <div>
                          <h3 className="font-medium">{content.name}</h3>
                          <p className="text-sm text-gray-400">
                            {content.accessUrl ? 'Abrir en nueva ventana' : 'Ver contenido'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Si el perk incluye acceso a eventos, mostrar información */}
                {perk.eventAccess && perk.eventAccess.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Eventos Incluidos</h3>
                    {perk.eventAccess.map((event) => (
                      <div key={event.eventId} className="p-3 bg-gray-700 rounded-lg mb-2">
                        <p className="font-medium">{event.eventName}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
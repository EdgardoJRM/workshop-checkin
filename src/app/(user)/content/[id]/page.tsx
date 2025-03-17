'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Importación dinámica para los visores
const PDFViewer = dynamic(() => import('@/components/shared/PDFViewer'), {
  ssr: false,
  loading: () => <p className="text-center py-10">Cargando visor de PDF...</p>,
});

const ImageViewer = dynamic(() => import('@/components/shared/ImageViewer'), {
  ssr: false,
  loading: () => <p className="text-center py-10">Cargando visor de imágenes...</p>,
});

interface ContentPageProps {
  params: {
    id: string;
  };
}

interface Content {
  id: string;
  title: string;
  type: 'pdf' | 'images';
  url?: string;
  images?: string[];
}

export default function ContentPage({ params }: ContentPageProps) {
  const router = useRouter();
  const { id } = params;
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`/api/content/${id}`);
        
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          if (res.status === 404) {
            setError('Contenido no encontrado');
            return;
          }
          throw new Error('Error al cargar contenido');
        }

        const data = await res.json();
        setContent(data.content);
      } catch (err) {
        setError('Error al cargar el contenido');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-center mb-4">{error}</div>
          <Link href="/profile" className="block w-full text-center py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Volver a mi perfil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {content?.title || 'Contenido'}
          </h1>
          <Link href="/profile" className="text-indigo-600 hover:text-indigo-900">
            Volver a mi perfil
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {content && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {content.type === 'pdf' && (
                <div className="aspect-[16/9] w-full">
                  <PDFViewer url={content.url} />
                </div>
              )}
              
              {content.type === 'images' && (
                <div className="w-full">
                  <ImageViewer 
                    images={content.images} 
                    title={content.title}
                  />
                </div>
              )}

              {content.type !== 'pdf' && content.type !== 'images' && (
                <div className="text-center py-10">
                  <p>Tipo de contenido no soportado</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ProtectedContentProps {
  url: string;
  type: 'pdf' | 'ebook' | 'calculator';
  title: string;
}

export default function ProtectedContent({ url, type, title }: ProtectedContentProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Obtener datos del usuario para la marca de agua
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData(user);

    // Prevenir acciones de usuario
    const preventActions = (e: any) => {
      e.preventDefault();
      return false;
    };

    // Deshabilitar clic derecho y atajos de teclado
    document.addEventListener('contextmenu', preventActions);
    document.addEventListener('keydown', (e) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'p' || e.key === 'P')) ||
        (e.key === 'PrintScreen')
      ) {
        preventActions(e);
      }
    });

    return () => {
      document.removeEventListener('contextmenu', preventActions);
      document.removeEventListener('keydown', preventActions);
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  if (type === 'calculator') {
    return (
      <div className="w-full h-full min-h-[600px] relative">
        <iframe 
          src={url}
          className="w-full h-full border-0"
          style={{ pointerEvents: 'auto' }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        
        <div className="relative">
          {/* Contenedor del PDF con marca de agua */}
          <div className="pdf-container relative">
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              className="max-w-full"
            >
              <Page 
                pageNumber={pageNumber} 
                className="max-w-full"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>

            {/* Marca de agua con nombre de usuario */}
            {userData && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  opacity: 0.15,
                  transform: 'rotate(-45deg)',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#000',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                }}
              >
                <div className="text-center select-none">
                  <div>{userData.email}</div>
                  <div>{new Date().toISOString().split('T')[0]}</div>
                </div>
              </div>
            )}
          </div>

          {/* Controles de navegación */}
          {numPages && numPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Anterior
              </button>
              <p className="text-center">
                Página {pageNumber} de {numPages}
              </p>
              <button
                onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                disabled={pageNumber >= numPages}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Aviso legal */}
        <div className="mt-6 text-sm text-gray-500 text-center">
          Este material está protegido por derechos de autor. 
          Acceso exclusivo para {userData?.email || 'usuario autorizado'}.
          <br />
          Prohibida su reproducción, distribución o almacenamiento sin autorización.
        </div>
      </div>
    </div>
  );
} 
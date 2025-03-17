'use client';

import { useState, useEffect } from 'react';

interface ImageViewerProps {
  images: string[];
  title?: string;
}

export default function ImageViewer({ images, title }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [username, setUsername] = useState<string>('');
  
  // Obtener nombre de usuario para marca de agua
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.email) {
            setUsername(data.user.email);
          }
        }
      } catch (error) {
        console.error("Error fetching user info for watermark:", error);
      }
    }
    
    fetchUserInfo();
  }, []);

  // Navegación entre imágenes
  function previous() {
    setCurrentIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  }

  function next() {
    setCurrentIndex((prevIndex) => 
      prevIndex < images.length - 1 ? prevIndex + 1 : prevIndex
    );
  }

  // Zoom
  function zoomIn() {
    setScale(prevScale => Math.min(prevScale + 0.2, 2.5));
  }

  function zoomOut() {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  }

  // Prevenir clic derecho para evitar descargas
  function preventContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    return false;
  }

  // Prevenir arrastrar la imagen
  function preventDragStart(e: React.DragEvent) {
    e.preventDefault();
    return false;
  }

  // Deshabilitar atajos de teclado comunes para copiar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detectar Ctrl+C, Ctrl+P, Ctrl+S, Print Screen
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'p' || e.key === 's')) ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="image-viewer">
      {/* Controles de zoom y navegación */}
      <div className="flex justify-between items-center mb-4 p-2 bg-gray-100 rounded">
        <div className="flex space-x-2">
          <button
            onClick={zoomOut}
            className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
            disabled={scale <= 0.5}
          >
            -
          </button>
          <span className="px-3 py-1 bg-white border border-gray-300 rounded">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
            disabled={scale >= 2.5}
          >
            +
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={previous}
            className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
            disabled={currentIndex <= 0}
          >
            ←
          </button>
          <span className="px-3 py-1">
            Página {currentIndex + 1} de {images.length}
          </span>
          <button
            onClick={next}
            className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
            disabled={currentIndex >= images.length - 1}
          >
            →
          </button>
        </div>
      </div>

      {/* Visor de Imágenes con protección */}
      <div 
        className="image-container flex justify-center border border-gray-300 rounded bg-gray-200 overflow-auto"
        style={{ height: '75vh' }}
      >
        <div 
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-in-out',
            position: 'relative',
            margin: 'auto'
          }}
          className="select-none" // Prevenir selección de texto
        >
          {images.length > 0 && (
            <div 
              onContextMenu={preventContextMenu}
              onDragStart={preventDragStart}
              className="relative"
              style={{ 
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                userSelect: 'none',
              }}
            >
              {/* Imagen actual */}
              <img
                src={images[currentIndex]}
                alt={`${title || 'Documento'} - Página ${currentIndex + 1}`}
                className="max-h-[70vh] w-auto object-contain"
                style={{ 
                  pointerEvents: 'none',  // Más protección contra descargas
                }}
              />
              
              {/* Marca de agua dinámica con el email del usuario */}
              {username && (
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
                    <div>{username}</div>
                    <div>{new Date().toISOString().split('T')[0]}</div>
                  </div>
                </div>
              )}
              
              {/* Overlay invisible para prevenir capturas de pantalla sencillas */}
              <div className="absolute inset-0 bg-transparent" />
            </div>
          )}
        </div>
      </div>
      
      {/* Advertencia legal */}
      <div className="text-center text-xs text-gray-500 mt-2">
        Este material está protegido por derechos de autor. Acceso exclusivo para {username || 'usuario autorizado'}.
        Prohibida su reproducción, distribución o almacenamiento sin autorización.
      </div>
    </div>
  );
} 
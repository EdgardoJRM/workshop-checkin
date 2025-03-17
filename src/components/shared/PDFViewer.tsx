'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      if (newPage > 0 && newPage <= (numPages || 1)) {
        return newPage;
      }
      return prevPageNumber;
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function zoomIn() {
    setScale(prevScale => Math.min(prevScale + 0.2, 2.5));
  }

  function zoomOut() {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  }

  return (
    <div className="pdf-viewer">
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
            onClick={previousPage}
            className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
            disabled={pageNumber <= 1}
          >
            ←
          </button>
          <span className="px-3 py-1">
            Página {pageNumber} de {numPages || '--'}
          </span>
          <button
            onClick={nextPage}
            className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
            disabled={pageNumber >= (numPages || 1)}
          >
            →
          </button>
        </div>
      </div>

      {/* Visor de PDF */}
      <div className="pdf-container flex justify-center border border-gray-300 rounded bg-gray-200 overflow-auto" style={{ height: '75vh' }}>
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => console.error('Error al cargar PDF:', error)}
          loading={<div className="p-5 text-center">Cargando PDF...</div>}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={<div className="p-5 text-center">Cargando página...</div>}
          />
        </Document>
      </div>
    </div>
  );
} 
'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'admin') {
        router.replace('/dashboard');
      } else {
        router.replace('/qr-access');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800 px-6">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="text-center max-w-lg relative">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-200 to-purple-200 text-transparent bg-clip-text">
          Acceso Exclusivo al Taller
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Solo los invitados pueden asegurar su entrada. Regístrate ahora y recibe tu{" "}
          <span className="text-blue-400 font-semibold">QR Code VIP</span> para ingresar.
        </p>

        <div className="mt-8 space-y-4">
          <a 
            href="/register"
            className="block w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-700 hover:to-purple-800 text-white text-lg font-semibold rounded-xl shadow-lg transition-transform transform hover:scale-105"
          >
            Registrarme
          </a>

          <a 
            href="/login"
            className="block w-full px-8 py-3 bg-white/10 hover:bg-white/20 text-white text-lg font-semibold rounded-xl shadow-lg transition-all"
          >
            Iniciar Sesión
          </a>
        </div>

        <p className="mt-10 text-sm text-gray-400">© 2025 - Evento Privado</p>
      </div>
    </div>
  );
}


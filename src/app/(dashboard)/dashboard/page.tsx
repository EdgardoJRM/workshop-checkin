'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Gift,
  CalendarDays,
  QrCode,
  Settings,
  LogOut,
  Printer
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Cargando...</div>
      </div>
    );
  }

  const menuItems = [
    {
      name: 'Usuarios',
      description: 'Gestionar usuarios y roles',
      icon: Users,
      href: '/dashboard/users',
      admin: true
    },
    {
      name: 'Perks',
      description: 'Gestionar perks y beneficios',
      icon: Gift,
      href: '/dashboard/perks',
      admin: true
    },
    {
      name: 'Eventos',
      description: 'Gestionar eventos y talleres',
      icon: CalendarDays,
      href: '/dashboard/events',
      admin: true
    },
    {
      name: 'Escanear QR',
      description: 'Registrar asistencia a eventos',
      icon: QrCode,
      href: '/scan',
      admin: true
    },
    {
      name: 'Imprimir Credenciales',
      description: 'Imprimir credenciales de usuarios',
      icon: Printer,
      href: '/dashboard/print-badges',
      admin: true
    },
    {
      name: 'Configuración',
      description: 'Ajustes de la cuenta',
      icon: Settings,
      href: '/profile',
      admin: false
    }
  ];

  const filteredItems = session.user.role === 'admin'
    ? menuItems
    : menuItems.filter(item => !item.admin);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Bienvenido, {session.user.name}
        </h1>
        <p className="mt-2 text-gray-600">
          ¿Qué te gustaría hacer hoy?
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card
            key={item.name}
            className="group cursor-pointer p-6 transition-all hover:shadow-lg"
            onClick={() => router.push(item.href)}
          >
            <div className="flex items-start justify-between">
              <div>
                <item.icon className="h-8 w-8 text-blue-500" />
                <h2 className="mt-4 text-xl font-semibold">{item.name}</h2>
                <p className="mt-2 text-sm text-gray-600">
                  {item.description}
                </p>
              </div>
              <div className="rounded-full bg-blue-50 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <item.icon className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => router.push('/api/auth/signout')}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
} 
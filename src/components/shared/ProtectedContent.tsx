'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface ProtectedContentProps {
  children: ReactNode;
  requiredRole?: string;
  requiredPerks?: string[];
  requiredEvents?: string[];
}

export default function ProtectedContent({
  children,
  requiredRole,
  requiredPerks = [],
  requiredEvents = []
}: ProtectedContentProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const user = session.user;

  if (!user.isActive) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Cuenta Pendiente de Activación</h2>
        <p className="mt-2 text-gray-600">
          Tu cuenta está pendiente de activación. Por favor, contacta al administrador.
        </p>
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Acceso Denegado</h2>
        <p className="mt-2 text-gray-600">
          No tienes los permisos necesarios para acceder a este contenido.
        </p>
      </div>
    );
  }

  if (
    requiredPerks.length > 0 &&
    !requiredPerks.some(perk => user.perks?.includes(perk))
  ) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Acceso Restringido</h2>
        <p className="mt-2 text-gray-600">
          Necesitas tener acceso a los perks requeridos para ver este contenido.
        </p>
      </div>
    );
  }

  if (
    requiredEvents.length > 0 &&
    !requiredEvents.some(event => user.eventAccess?.includes(event))
  ) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Acceso Restringido</h2>
        <p className="mt-2 text-gray-600">
          Necesitas tener acceso a los eventos requeridos para ver este contenido.
        </p>
      </div>
    );
  }

  return <>{children}</>;
} 
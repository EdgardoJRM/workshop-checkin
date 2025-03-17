'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Gift, 
  Calendar, 
  QrCode, 
  Menu, 
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { Toaster } from '@/components/ui/toaster';

const menuItems = [
  {
    href: '/dashboard',
    icon: QrCode,
    label: 'Check-in',
    adminOnly: false
  },
  {
    href: '/dashboard/users',
    icon: Users,
    label: 'Usuarios',
    adminOnly: true
  },
  {
    href: '/dashboard/perks',
    icon: Gift,
    label: 'Perks',
    adminOnly: true
  },
  {
    href: '/dashboard/events',
    icon: Calendar,
    label: 'Eventos',
    adminOnly: true
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    router.push('/login');
  };

  const filteredMenuItems = menuItems.filter(
    item => !item.adminOnly || session.user.role === 'admin'
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
} 
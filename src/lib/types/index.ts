// Tipos de usuario
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  perks: string[];
  eventAccess: string[];
  isActive: boolean;
  createdAt?: string;
  password?: string; // Solo utilizado en operaciones internas
}

export type UserRole = 'admin' | 'staff' | 'user';

// Tipos para eventos
export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  capacity: number;
  registeredUsers: number;
  isActive: boolean;
  createdAt?: string;
  createdBy?: string;
}

// Tipos para perks
export interface Perk {
  id: string;
  name: string;
  description: string;
  type: PerkType;
  assignedUsers?: number;
  createdAt?: string;
}

export type PerkType = 'material' | 'access' | 'certificate' | 'other';

// Tipos para contenido
export interface Content {
  id: string;
  title: string;
  description?: string;
  type: 'pdf' | 'images';
  url?: string; // URL del PDF
  images?: string[]; // Array de URLs de imágenes
  requiredPerks: string[]; // Perks necesarios para acceder
  createdAt?: string;
  createdBy?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 
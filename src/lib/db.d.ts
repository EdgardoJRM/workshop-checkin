interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'staff' | 'user';
  perks: string[];
  eventAccess: string[];
  isActive: boolean;
  createdAt: string;
}

interface UserModel {
  create: (userData: {
    id: string;
    email: string;
    name: string;
    password: string;
    role?: string;
    perks?: string[];
    eventAccess?: string[];
    isActive?: boolean;
  }) => Promise<User>;

  findUnique: (where: { id?: string; email?: string }) => Promise<User | null>;

  findMany: (options?: {
    select?: Record<string, boolean>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }) => Promise<User[]>;

  update: (
    where: { id: string },
    data: {
      name?: string;
      role?: string;
      perks?: string[];
      eventAccess?: string[];
      isActive?: boolean;
      password?: string;
    }
  ) => Promise<User | null>;

  delete: (where: { id: string }) => Promise<User | null>;
}

export interface DB {
  user: UserModel;
}

export const db: DB;
export const createMockData: () => Promise<void>; 
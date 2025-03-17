export interface User {
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

export interface UserCreateInput {
  id: string;
  email: string;
  name: string;
  password: string;
  role?: string;
  perks?: string[];
  eventAccess?: string[];
  isActive?: boolean;
}

export interface UserUpdateInput {
  name?: string;
  role?: string;
  perks?: string[];
  eventAccess?: string[];
  isActive?: boolean;
  password?: string;
}

export interface UserSelect {
  id?: boolean;
  email?: boolean;
  name?: boolean;
  role?: boolean;
  perks?: boolean;
  eventAccess?: boolean;
  isActive?: boolean;
  createdAt?: boolean;
}

export interface FindUniqueOptions {
  where: { id?: string; email?: string };
  select?: UserSelect;
}

export interface UpdateOptions {
  where: { id: string };
  data: UserUpdateInput;
  select?: UserSelect;
}

export interface DeleteOptions {
  where: { id: string };
}

export interface UserModel {
  create(userData: UserCreateInput): Promise<User>;
  findUnique(options: FindUniqueOptions): Promise<User | null>;
  findMany(options?: { select?: UserSelect; orderBy?: Record<string, 'asc' | 'desc'> }): Promise<User[]>;
  update(options: UpdateOptions): Promise<User | null>;
  delete(options: DeleteOptions): Promise<User | null>;
}

export interface DB {
  user: UserModel;
} 
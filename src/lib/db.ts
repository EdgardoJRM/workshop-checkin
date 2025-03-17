import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Configurar el cliente de DynamoDB
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.USER_TABLE || 'WorkshopUsers';

// Tipos de contenido para los perks
export type ContentType = 'ebook' | 'calculator' | 'certificate' | 'course' | 'tool';

export type PerkType = 'basic' | 'premium' | 'vip';

export interface Content {
  id: string;
  type: ContentType;
  name: string;
  url: string;
  isProtected: boolean;
  accessUrl?: string;
  perkId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  type: PerkType;
  price: number;
  contents: Content[];
  eventAccess?: {
    eventId: string;
    eventName: string;
    date: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPerk {
  id: string;
  userId: string;
  perkId: string;
  perk: Perk;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email?: string;
  name: string;
  password?: string;
  role?: 'admin' | 'staff' | 'user';
  perks?: string[];
  eventAccess?: string[];
  isActive?: boolean;
  type?: 'user' | 'event' | 'perk' | 'access_log';
  date?: string;
  location?: string;
  capacity?: number | null;
  description?: string;
  price?: number;
  contents?: Content[];
  userId?: string;
  eventId?: string;
  eventName?: string;
  createdAt: Date;
  updatedAt?: Date;
}

function generateId(): string {
  return uuidv4();
}

export interface UserCreateInput {
  id: string;
  email: string;
  name: string;
  password: string;
  role?: 'admin' | 'staff' | 'user';
  perks?: string[];
  eventAccess?: string[];
  isActive?: boolean;
  type?: 'user' | 'event' | 'perk' | 'access_log';
}

export interface UserUpdateInput {
  name?: string;
  password?: string;
  role?: 'admin' | 'staff' | 'user';
  perks?: string[];
  eventAccess?: string[];
  isActive?: boolean;
}

export interface FindUniqueOptions {
  where: {
    id?: string;
    email?: string;
  };
}

export interface UpdateOptions {
  where: {
    id: string;
  };
  data: UserUpdateInput;
}

export interface DeleteOptions {
  where: {
    id: string;
  };
}

export interface UserModel {
  create(userData: UserCreateInput): Promise<User>;
  findUnique(options: FindUniqueOptions): Promise<User | null>;
  findMany(options?: { 
    select?: Record<string, boolean>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<User[]>;
  update(options: UpdateOptions): Promise<User | null>;
  delete(options: DeleteOptions): Promise<User | null>;
}

export interface PerkModel {
  create(perkData: Omit<Perk, 'id' | 'createdAt' | 'updatedAt'>): Promise<Perk>;
  findUnique(options: { where: { id: string } }): Promise<Perk | null>;
  findMany(options?: { 
    where?: { type?: string };
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<Perk[]>;
  update(options: { where: { id: string }; data: Partial<Perk> }): Promise<Perk | null>;
  delete(options: { where: { id: string } }): Promise<Perk | null>;
}

export interface DB {
  user: UserModel;
  perk: PerkModel;
}

const userModel: UserModel = {
  async create(userData: UserCreateInput): Promise<User> {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...userData,
        createdAt: new Date().toISOString()
      }
    });

    await docClient.send(command);
    return userData as User;
  },

  async findUnique(options: FindUniqueOptions): Promise<User | null> {
    if (options.where.id) {
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: options.where.id }
      });

      const response = await docClient.send(command);
      return response.Item as User || null;
    }

    if (options.where.email) {
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': options.where.email
        }
      });

      const response = await docClient.send(command);
      return (response.Items?.[0] as User) || null;
    }

    return null;
  },

  async findMany(options?: { 
    select?: Record<string, boolean>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<User[]> {
    const command = new ScanCommand({
      TableName: TABLE_NAME
    });

    const response = await docClient.send(command);
    return response.Items as User[];
  },

  async update(options: UpdateOptions): Promise<User | null> {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.entries(options.data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    if (updateExpression.length === 0) return null;

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: options.where.id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const response = await docClient.send(command);
    return response.Attributes as User;
  },

  async delete(options: DeleteOptions): Promise<User | null> {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id: options.where.id },
      ReturnValues: 'ALL_OLD'
    });

    const response = await docClient.send(command);
    return response.Attributes as User;
  }
};

const perkModel: PerkModel = {
  async create(perkData: Omit<Perk, 'id' | 'createdAt' | 'updatedAt'>): Promise<Perk> {
    const id = generateId();
    const now = new Date().toISOString();
    const perk: Perk = {
      ...perkData,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: perk
    });

    await docClient.send(command);
    return perk;
  },

  async findUnique(options: { where: { id: string } }): Promise<Perk | null> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: options.where.id }
    });

    const response = await docClient.send(command);
    return response.Item as Perk || null;
  },

  async findMany(options?: { 
    where?: { type?: string };
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<Perk[]> {
    const command = new ScanCommand({
      TableName: TABLE_NAME
    });

    const response = await docClient.send(command);
    let perks = response.Items as Perk[];

    if (options?.where?.type) {
      perks = perks.filter(perk => perk.type === options.where?.type);
    }

    if (options?.orderBy) {
      const [field, direction] = Object.entries(options.orderBy)[0];
      perks.sort((a, b) => {
        const aValue = a[field as keyof Perk];
        const bValue = b[field as keyof Perk];
        
        if (!aValue || !bValue) return 0;
        
        if (direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });
    }

    return perks;
  },

  async update(options: { where: { id: string }; data: Partial<Perk> }): Promise<Perk | null> {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.entries(options.data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    if (updateExpression.length === 0) return null;

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: options.where.id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const response = await docClient.send(command);
    return response.Attributes as Perk;
  },

  async delete(options: { where: { id: string } }): Promise<Perk | null> {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id: options.where.id },
      ReturnValues: 'ALL_OLD'
    });

    const response = await docClient.send(command);
    return response.Attributes as Perk;
  }
};

export const db: DB = {
  user: userModel,
  perk: perkModel
};

// Función para crear datos de prueba
export const createMockData = async () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('Verificando datos de prueba...');

  try {
    // Verificar si ya existen usuarios
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      Limit: 1
    });

    const response = await docClient.send(command);
    if (response.Items && response.Items.length > 0) {
      console.log('Ya existen datos de prueba');
      return;
    }

    console.log('Creando datos de prueba...');

    // Crear usuario administrador
    await db.user.create({
      id: '1',
      email: 'admin@example.com',
      name: 'Administrador',
      // Hash de "adminpassword"
      password: '$2a$10$XIVlhOXSqjbwVgM2h8iEiuRlvQ1Vj3Vt.XS2WcYfbnQgIqzTZCmOm',
      role: 'admin',
      perks: ['material-digital', 'material-impreso', 'videos-extra', 'certificado'],
      eventAccess: ['workshop-2024', 'conferencia-enero', 'webinar-febrero'],
      isActive: true
    });

    // Crear usuario staff
    await db.user.create({
      id: '2',
      email: 'staff@example.com',
      name: 'Staff User',
      // Hash de "staffpassword"
      password: '$2a$10$iJUzMDYy8JFp7.9m7vK3QO./vAl5pjdgRq5PKXJXIaRSH7NcR9vcy',
      role: 'staff',
      perks: ['material-digital', 'videos-extra'],
      eventAccess: ['workshop-2024'],
      isActive: true
    });

    // Crear usuario regular
    await db.user.create({
      id: '3',
      email: 'user@example.com',
      name: 'Regular User',
      // Hash de "userpassword"
      password: '$2a$10$uPZEQZFkivYiCUf7ZEBBkuAWykdm9FbE4.CGQPKWi3DSXlBgNGkHy',
      role: 'user',
      perks: ['material-digital'],
      eventAccess: ['workshop-2024'],
      isActive: true
    });

    console.log('Datos de prueba creados exitosamente');
  } catch (error) {
    console.error('Error al crear datos de prueba:', error);
    throw error;
  }
};

export async function createUser(data: Omit<UserCreateInput, 'id'>): Promise<User> {
  const id = generateId();
  const user = { ...data, id } as UserCreateInput;
  await db.user.create(user);
  return user as User;
} 
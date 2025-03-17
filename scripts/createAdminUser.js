// Script para crear un usuario administrador
// Ejecutar con: node scripts/createAdminUser.js

const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Configuración de DynamoDB
const client = new DynamoDB({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'fake-access-key-id',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'fake-secret-access-key',
  },
  // Para desarrollo local, usar DynamoDB local
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
});

const docClient = DynamoDBDocument.from(client);
const tableName = process.env.USER_TABLE || 'WorkshopUsers';

// Función para crear usuario administrador
const createAdminUser = async () => {
  try {
    // Datos del usuario administrador
    const adminEmail = 'admin@example.com';
    const adminPassword = 'adminpassword'; // En producción, usar una contraseña fuerte
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const userId = uuidv4();
    
    // Verificar si ya existe un usuario con ese email
    const params = {
      TableName: tableName,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': adminEmail
      }
    };
    
    const existingUser = await docClient.query(params);
    
    if (existingUser.Items && existingUser.Items.length > 0) {
      console.log(`El usuario admin con email ${adminEmail} ya existe.`);
      return;
    }
    
    // Crear el usuario administrador
    const adminUser = {
      id: userId,
      email: adminEmail,
      name: 'Administrador',
      password: hashedPassword,
      role: 'admin',
      perks: ['material-digital', 'material-impreso', 'videos-extra', 'certificado'],
      eventAccess: ['workshop-2024', 'conferencia-enero', 'webinar-febrero'],
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    await docClient.put({
      TableName: tableName,
      Item: adminUser
    });
    
    console.log(`Usuario administrador creado con éxito: ${adminEmail}`);
    console.log('Contraseña:', adminPassword);
    console.log('No olvides cambiar esta contraseña en un entorno de producción.');
    
  } catch (error) {
    console.error('Error al crear usuario administrador:', error);
  }
};

// Ejecutar la función
createAdminUser(); 
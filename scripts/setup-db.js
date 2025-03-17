const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Configuración para desarrollo local
const client = new DynamoDB({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
  }
});

// Cliente de documento para operaciones más sencillas
const docClient = DynamoDBDocument.from(client);

// Nombre de la tabla
const USER_TABLE = process.env.USER_TABLE || 'WorkshopUsers';

// Función principal
async function setupDB() {
  console.log('Iniciando configuración de la base de datos...');

  try {
    // Crear tabla de usuarios si no existe
    await createUserTable();

    // Crear usuario administrador inicial si no existe
    await createAdminUser();

    console.log('Configuración completada con éxito.');
  } catch (error) {
    console.error('Error en la configuración:', error);
    process.exit(1);
  }
}

// Función para crear la tabla de usuarios
async function createUserTable() {
  try {
    // Verificar si la tabla ya existe
    const tables = await client.listTables({});
    if (tables.TableNames?.includes(USER_TABLE)) {
      console.log(`Tabla ${USER_TABLE} ya existe, omitiendo creación.`);
      return;
    }

    // Definición de la tabla
    console.log(`Creando tabla ${USER_TABLE}...`);
    const params = {
      TableName: USER_TABLE,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' } // Clave primaria
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'EmailIndex',
          KeySchema: [
            { AttributeName: 'email', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };

    await client.createTable(params);
    console.log(`Tabla ${USER_TABLE} creada correctamente.`);

    // Esperar a que la tabla esté activa
    console.log('Esperando a que la tabla esté activa...');
    let tableActive = false;
    while (!tableActive) {
      const result = await client.describeTable({ TableName: USER_TABLE });
      if (result.Table.TableStatus === 'ACTIVE') {
        tableActive = true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    console.log('Tabla activa y lista para usar.');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`Tabla ${USER_TABLE} ya existe.`);
    } else {
      throw error;
    }
  }
}

// Función para crear usuario administrador
async function createAdminUser() {
  try {
    // Verificar si ya existe un usuario admin
    const params = {
      TableName: USER_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': 'admin@example.com'
      }
    };

    const result = await docClient.query(params);
    if (result.Items && result.Items.length > 0) {
      console.log('Usuario administrador ya existe, omitiendo creación.');
      return;
    }

    // Crear usuario administrador
    console.log('Creando usuario administrador...');
    const hashedPassword = await bcrypt.hash('adminpassword', 10);
    
    await docClient.put({
      TableName: USER_TABLE,
      Item: {
        id: uuidv4(),
        email: 'admin@example.com',
        name: 'Administrador',
        password: hashedPassword,
        role: 'admin',
        perks: ['material-digital', 'material-impreso', 'videos-extra', 'certificado'],
        eventAccess: ['workshop-2024', 'conferencia-enero', 'webinar-febrero'],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    });

    console.log('Usuario administrador creado con éxito.');
    console.log('Email: admin@example.com');
    console.log('Contraseña: adminpassword');
  } catch (error) {
    throw error;
  }
}

// Ejecutar configuración
setupDB(); 
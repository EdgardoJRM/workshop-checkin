// Script para crear la tabla de usuarios en DynamoDB
// Ejecutar con: node scripts/createDynamoDBTable.js

const { DynamoDB } = require('@aws-sdk/client-dynamodb');

// Configuración de DynamoDB
const dynamodb = new DynamoDB({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'fake-access-key-id',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'fake-secret-access-key',
  },
  // Para desarrollo local, usar DynamoDB local
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
});

const tableName = process.env.USER_TABLE || 'WorkshopUsers';

// Definición de la tabla
const params = {
  TableName: tableName,
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' },  // Clave primaria
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'email', AttributeType: 'S' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'EmailIndex',
      KeySchema: [
        { AttributeName: 'email', KeyType: 'HASH' },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

// Crear la tabla
const createTable = async () => {
  try {
    console.log(`Creando tabla "${tableName}"...`);
    
    // Verificar si la tabla ya existe
    try {
      const existingTable = await dynamodb.describeTable({ TableName: tableName });
      console.log(`La tabla "${tableName}" ya existe.`);
      return;
    } catch (error) {
      // Si la tabla no existe, continuamos con la creación
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
    }
    
    // Crear la tabla
    const result = await dynamodb.createTable(params);
    console.log(`Tabla "${tableName}" creada exitosamente:`, result);
    
    // Esperar hasta que la tabla esté activa
    console.log('Esperando a que la tabla esté activa...');
    await dynamodb.waitFor('tableExists', { TableName: tableName });
    console.log('¡Tabla lista para usar!');
    
  } catch (error) {
    console.error('Error al crear la tabla:', error);
  }
};

// Ejecutar la función
createTable(); 
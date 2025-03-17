import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Obtener credenciales de manera segura
const getAwsCredentials = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;

  if (!accessKeyId || !secretAccessKey || !region) {
    throw new Error(
      "AWS credentials or region not properly configured. Please check your environment variables."
    );
  }

  return {
    accessKeyId,
    secretAccessKey,
    region,
  };
};

// Validar configuración de DynamoDB
const validateDynamoConfig = () => {
  const tableName = process.env.USER_TABLE;
  if (!tableName) {
    throw new Error(
      "DynamoDB table name not configured. Please set USER_TABLE in your environment variables."
    );
  }
  return tableName;
};

let db: DynamoDBDocumentClient;
let USER_TABLE: string;

try {
  const { accessKeyId, secretAccessKey, region } = getAwsCredentials();
  USER_TABLE = validateDynamoConfig();

  const client = new DynamoDBClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
  console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY);
  console.log("AWS_REGION:", process.env.AWS_REGION);

  db = DynamoDBDocumentClient.from(client);
} catch (error) {
  console.error("Error initializing AWS DynamoDB:", error);
  throw error;
}

export { db, USER_TABLE };

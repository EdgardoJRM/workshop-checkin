import { SignJWT, jwtVerify } from "jose";

// Definir secreto para firmar JWT (debe estar en .env)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

// Tiempo de expiración del token (7 días)
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

// Función para crear un JWT
export async function sign(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRES_IN)
    .setIssuedAt()
    .sign(JWT_SECRET);

  return token;
}

// Función para verificar un JWT
export async function verify(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    console.error("Error al verificar JWT:", error);
    throw new Error("Token JWT inválido o expirado");
  }
}

// Function to decode a token without verifying the signature
// Useful for debugging or getting the payload without verification
export function decode(token: string): Record<string, unknown> {
  try {
    // Decode the token without verification
    const decoded = jose.decodeJwt(token);
    return decoded as Record<string, unknown>;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    throw new Error('Malformed token');
  }
} 
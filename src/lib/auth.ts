import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Credenciales_Incompletas');
          }

          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user) {
            throw new Error('Usuario_No_Encontrado');
          }

          if (!user.isActive) {
            throw new Error('Usuario_Inactivo');
          }

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error('Contraseña_Incorrecta');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          // Manejar errores específicos
          const errorMessage = error instanceof Error ? error.message : 'Error_Desconocido';
          switch (errorMessage) {
            case 'Credenciales_Incompletas':
              throw new Error('Email y contraseña son requeridos');
            case 'Usuario_No_Encontrado':
              throw new Error('Usuario no encontrado');
            case 'Usuario_Inactivo':
              throw new Error('Tu cuenta está pendiente de aprobación por un administrador');
            case 'Contraseña_Incorrecta':
              throw new Error('Contraseña incorrecta');
            default:
              throw new Error('Error al iniciar sesión');
          }
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Permitir redirecciones internas
      if (url.startsWith(baseUrl) || url.startsWith('/')) {
        // Si el usuario intenta acceder a una ruta protegida, guardarla como callbackUrl
        if (!url.includes('/login') && !url.includes('/register')) {
          const callbackUrl = url.startsWith('/') ? url : url.replace(baseUrl, '');
          return `${baseUrl}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
        }
        return url.startsWith('/') ? `${baseUrl}${url}` : url;
      }
      
      // Por defecto, redirigir al baseUrl
      return baseUrl;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
} 
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error('Usuario no encontrado');
        }

        if (!user.isActive) {
          throw new Error('Usuario inactivo. Contacta al administrador.');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Contraseña incorrecta');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          perks: user.perks || [],
          eventAccess: user.eventAccess || [],
          isActive: user.isActive
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          role: user.role,
          perks: user.perks,
          eventAccess: user.eventAccess,
          isActive: user.isActive
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
          perks: token.perks,
          eventAccess: token.eventAccess,
          isActive: token.isActive
        }
      };
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
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt'
  }
}; 
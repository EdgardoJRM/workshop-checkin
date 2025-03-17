import { User } from '../types';

export const checkUserRole = (user: User, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(user.role);
};

export const generateEmailTemplate = (user: User, event?: string): string => {
  return `
    Hola ${user.name},
    
    Bienvenido a nuestro evento${event ? ` "${event}"` : ''}.
    
    Tus credenciales de acceso son:
    Email: ${user.email}
    
    Por favor, accede a través de nuestra plataforma para más detalles.
    
    Saludos,
    El equipo de eventos
  `;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; 
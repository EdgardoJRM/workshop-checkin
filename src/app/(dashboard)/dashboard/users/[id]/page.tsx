import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import UserEditForm from './UserEditForm';

async function getUser(id: string) {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        perks: true,
        eventAccess: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export default async function UserEditPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);

  if (!user) {
    redirect('/dashboard/users');
  }

  return <UserEditForm initialUser={user} />;
} 
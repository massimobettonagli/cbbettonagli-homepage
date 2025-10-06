'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
  if (status === 'unauthenticated') {
    router.replace('/login');
  } else if (status === 'authenticated') {
    const isAdmin = (session?.user as any)?.isAdmin;

    if (isAdmin) {
      router.replace('/dashboard-admin');
    } else {
      router.replace('/dashboard');
    }
  }
}, [status, session, router]);

  return (
    <div className="pt-28 flex justify-center">
      <p className="text-sm text-gray-500">Redirezionamento in corso...</p>
    </div>
  );
}


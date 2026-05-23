'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function useAuth() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  return isAuthed;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );
}

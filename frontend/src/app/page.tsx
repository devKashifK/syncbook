'use client';

import { useBoardStore } from '../store/boardStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const activeBoardId = useBoardStore(state => state.activeBoardId);
  const router = useRouter();

  useEffect(() => {
    if (activeBoardId) {
      router.push(`/board/${activeBoardId}`);
    } else {
      router.push('/dashboard');
    }
  }, [activeBoardId, router]);

  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );
}

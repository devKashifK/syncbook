'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User, LayoutDashboard, Settings, Info } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import TechSpecsModal from './TechSpecsModal';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isTechSpecsOpen, setIsTechSpecsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        setUserEmail(decoded.sub ?? null);
      } catch {
        setUserEmail(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    router.push('/login');
  };

  const avatarLetter = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <header className="md:hidden h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 font-bold text-base">
          <div className="w-7 h-7 flex items-center justify-center">
            <img src="/task-management.png" alt="SyncBoard" />
          </div>
          <span className="text-slate-800 text-sm font-semibold">SyncBoard</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600" onClick={() => setIsTechSpecsOpen(true)}>
            <Info className="h-4 w-4" />
          </Button>
          <Avatar className="h-7 w-7 ring-2 ring-slate-100">
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">{avatarLetter}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <nav className="hidden md:flex h-14 border-b border-slate-200 bg-white items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 font-bold text-lg">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/task-management.png" alt="SyncBoard" />
            </div>
            <span className="text-slate-800">SyncBoard</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="text-sm font-medium text-slate-600 flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
              <User className="h-4 w-4 text-slate-400" />
              {userEmail}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            onClick={() => setIsTechSpecsOpen(true)}
            title="System Architecture"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-slate-100">
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{avatarLetter}</AvatarFallback>
          </Avatar>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50 pb-safe shadow-lg">
        <Link
          href="/dashboard"
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-full text-slate-500 hover:text-blue-600 transition-colors',
            pathname === '/dashboard' && 'text-blue-600 font-semibold'
          )}
        >
          <LayoutDashboard className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Dashboard</span>
        </Link>

        <button
          onClick={() => setIsTechSpecsOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full text-slate-500 hover:text-blue-600 transition-colors"
        >
          <Info className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Info</span>
        </button>

        <Link
          href="/settings"
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-full text-slate-500 hover:text-blue-600 transition-colors',
            pathname === '/settings' && 'text-blue-600 font-semibold'
          )}
        >
          <Settings className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Settings</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 h-full text-slate-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Logout</span>
        </button>
      </nav>

      <TechSpecsModal isOpen={isTechSpecsOpen} onClose={() => setIsTechSpecsOpen(false)} />
    </>
  );
}

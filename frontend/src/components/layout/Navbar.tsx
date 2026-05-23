'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User, LayoutDashboard, Settings } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        const email = decodedPayload.sub;
        setTimeout(() => {
          setUserEmail(email);
        }, 0);
      } catch (e) {
        console.error("Failed to parse token", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 font-bold text-base">
          <div className="w-7 h-7 flex items-center justify-center">
            <img src="/task-management.png" alt="SyncBoard" />
          </div>
          <span className="text-slate-800 text-sm font-semibold">SyncBoard</span>
        </Link>
        <Avatar className="h-7 w-7 ring-2 ring-slate-100">
          <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">
            {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
      </header>

      {/* Desktop Top Navbar */}
      <nav className="hidden md:flex h-14 border-b border-slate-200 bg-white items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 font-bold text-lg">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/task-management.png" alt="SyncBoard" />
            </div>
            <span className="text-slate-800">SyncBoard</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm font-medium text-slate-600 mr-2 flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
              <User className="h-4 w-4 text-slate-400" />
              {userEmail}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-slate-100">
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50 pb-safe shadow-lg">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full text-slate-500 hover:text-blue-600 transition-colors",
            pathname === '/dashboard' && "text-blue-600 font-semibold"
          )}
        >
          <LayoutDashboard className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Dashboard</span>
        </Link>

        <Link
          href="/settings"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full text-slate-500 hover:text-blue-600 transition-colors",
            pathname === '/settings' && "text-blue-600 font-semibold"
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
    </>
  );
}

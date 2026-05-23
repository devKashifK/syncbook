'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Kanban, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        setUserEmail(decodedPayload.sub);
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
    <nav className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <div className="w-8 h-8  flex items-center justify-center ">
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
  );
}

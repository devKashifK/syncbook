'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBoardStore } from '../../store/boardStore';
import { LayoutDashboard, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Sidebar() {
  const boards = useBoardStore(state => state.boards);
  const activeBoardId = useBoardStore(state => state.activeBoardId);
  const fetchAllBoards = useBoardStore(state => state.fetchAllBoards);
  const pathname = usePathname();

  useEffect(() => {
    fetchAllBoards();
  }, [fetchAllBoards]);

  // Do not show the sidebar on the main dashboard screen
  if (pathname === '/dashboard') {
    return null;
  }

  return (
    <aside className="w-64 border-r bg-slate-50 min-h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="p-4 py-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Your Boards
        </h2>
        <nav className="space-y-1">
          {boards.map(board => (
            <Link
              key={board.id}
              href={`/board/${board.id}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                (pathname === `/board/${board.id}` || activeBoardId === board.id && pathname === '/')
                  ? "bg-slate-200/50 text-primary"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              {board.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <nav className="space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
      </div>
    </aside>
  );
}

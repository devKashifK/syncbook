'use client';

import { useBoardStore } from '../../../../store/boardStore';
import { notFound } from 'next/navigation';
import { useEffect, use, useState } from 'react';
import { apiRequest } from '../../../../lib/api';
import BoardComponent from '../../../../components/board/Board';
import { Button } from '../../../../components/ui/button';
import { LayoutTemplate, Loader2, ArrowLeft } from 'lucide-react';
import NotAuthenticatedScreen from '../../../../components/auth/NotAuthenticatedScreen';
import Link from 'next/link';

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  // Extract id correctly for Next.js App router
  const { id } = use(params);
  const boards = useBoardStore(state => state.boards);
  const setActiveBoard = useBoardStore(state => state.setActiveBoard);
  const fetchTasks = useBoardStore(state => state.fetchTasks);
  
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [boardTitle, setBoardTitle] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch specific board to get title and projectId
        const boardData = await apiRequest(`/boards/${id}`);
        setBoardTitle(boardData.name || "Board");
        setProjectId(boardData.projectId);

        // Fetch tasks
        await fetchTasks(id);
        setActiveBoard(id);
      } catch (err: any) {
        if (err.message === 'Unauthorized') {
          setIsAuthenticated(false);
        } else {
          setIsNotFound(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [id, fetchTasks, setActiveBoard]);

  const board = boards.find(b => b.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen bg-slate-50">
        <div className="flex-1 overflow-y-auto pt-16">
          <NotAuthenticatedScreen />
        </div>
      </div>
    );
  }

  if (isNotFound || !board) {
    return notFound();
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="px-4 py-3 md:px-6 md:py-4 bg-white border-b sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
          <Button asChild variant="ghost" size="sm" className="text-slate-500 hover:text-slate-800 -ml-2 text-xs h-8">
            <Link href={projectId ? `/project/${projectId}` : "/dashboard"}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Link>
          </Button>
          <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg hidden sm:block">
            <LayoutTemplate className="h-4.5 w-4.5" />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800">{boardTitle}</h1>
          <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            {/* Filter button removed as it is unimplemented */}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Unimplemented share and avatar features have been removed */}
        </div>
      </div>
      <div className="flex-1 overflow-x-auto p-3 md:p-4">
        <BoardComponent board={board} />
      </div>
    </div>
  );
}

'use client';

import { useBoardStore } from '../../../../store/boardStore';
import { notFound } from 'next/navigation';
import { useEffect, use, useState } from 'react';
import { apiRequest } from '../../../../lib/api';
import BoardComponent from '../../../../components/board/Board';
import { buttonVariants } from '../../../../components/ui/button';
import { LayoutTemplate, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../../../lib/utils';
import { PageLoader } from '../../../../lib/auth';

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const boards = useBoardStore(state => state.boards);
  const setActiveBoard = useBoardStore(state => state.setActiveBoard);
  const fetchTasks = useBoardStore(state => state.fetchTasks);

  const [isLoading, setIsLoading] = useState(true);
  const [boardTitle, setBoardTitle] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const boardData = await apiRequest(`/boards/${id}`);
        setBoardTitle(boardData.name || 'Board');
        setProjectId(boardData.projectId);
        await fetchTasks(id);
        setActiveBoard(id);
      } catch (err: any) {
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [id, fetchTasks, setActiveBoard]);

  const board = boards.find(b => b.id === id);

  if (isLoading) return <PageLoader />;
  if (isNotFound || !board) return notFound();

  return (
    <div className="flex flex-col flex-1 h-full bg-slate-50/50">
      <div className="px-4 py-3 md:px-6 md:py-4 bg-white border-b sticky top-0 z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href={projectId ? `/project/${projectId}` : '/dashboard'}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-slate-500 hover:text-slate-800 -ml-2 text-xs h-8')}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back
          </Link>
          <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg hidden sm:block">
            <LayoutTemplate className="h-4.5 w-4.5" />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800">{boardTitle}</h1>
          <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />
        </div>
      </div>
      <div className="flex-1 overflow-x-auto p-3 md:p-4">
        <BoardComponent board={board} />
      </div>
    </div>
  );
}

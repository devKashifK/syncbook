'use client';

import { useEffect, useState, use } from 'react';
import { Plus, LayoutTemplate, FolderKanban, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../../../../lib/api';
import CreateBoardModal from '../../../../components/dashboard/CreateBoardModal';
import BoardCard from '../../../../components/dashboard/BoardCard';
import Link from 'next/link';
import { buttonVariants } from '../../../../components/ui/button';
import { cn } from '../../../../lib/utils';
import { PageLoader } from '../../../../lib/auth';

type Board = { id: string; name: string; userId: string; projectId: number };

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('Loading Project...');

  const fetchProjectData = async () => {
    try {
      const [projectsData, boardsData] = await Promise.all([
        apiRequest('/projects'),
        apiRequest(`/boards/project/${id}`),
      ]);
      if (Array.isArray(projectsData)) {
        const project = projectsData.find((p: any) => String(p.projectId) === id);
        setProjectTitle(project ? project.projectName : 'Unknown Project');
      }
      setBoards(Array.isArray(boardsData) ? boardsData : []);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjectData(); }, [id]);

  if (loading) return <PageLoader />;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-4 md:mb-8">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: 'ghost' }), 'mb-2 text-slate-500 hover:text-slate-800 -ml-4 text-xs h-8')}
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Projects
        </Link>
        <h1 className="text-xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
          <FolderKanban className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
          {projectTitle}
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Manage all the boards within this project.</p>
      </div>

      <div className="mb-6 md:mb-10">
        <h2 className="text-sm md:text-lg font-bold text-slate-800 flex items-center gap-2 mb-3 border-b pb-2 border-slate-200">
          <LayoutTemplate className="h-4 w-4 md:h-5 md:w-5 text-slate-500" />
          Project Boards
        </h2>

        {error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {boards.map(board => (
              <BoardCard
                key={board.id}
                board={board}
                onDelete={id => setBoards(prev => prev.filter(b => b.id !== id))}
                onRename={updated => setBoards(prev => prev.map(b => b.id === updated.id ? updated : b))}
              />
            ))}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-24 bg-slate-50 hover:bg-slate-100/80 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 transition-colors shadow-sm"
            >
              <Plus className="h-5 w-5 mb-0.5" />
              <span className="text-xs font-semibold">Create new board</span>
            </button>
          </div>
        )}
      </div>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={board => setBoards(prev => [...prev, board])}
        projectId={parseInt(id)}
      />
    </div>
  );
}

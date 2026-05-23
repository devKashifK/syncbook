'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Clock, Loader2, FolderKanban, LayoutDashboard, CheckSquare, Workflow, Trash2 } from "lucide-react";
import { apiRequest } from "../../../lib/api";
import CreateProjectModal from "../../../components/dashboard/CreateProjectModal";
import ProjectCard, { Project } from "../../../components/dashboard/ProjectCard";
import QuoteCarousel from "../../../components/dashboard/QuoteCarousel";
import Link from "next/link";

type Board = {
  id: string;
  name: string;
  projectId: number;
};

type Task = {
  id: number;
  taskName: string;
  status: string;
  boardId: number;
  timeSetByUser?: string;
  timeTakenByUser?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const fetchData = async () => {
    try {
      const [projectsData, boardsData, tasksData] = await Promise.all([
        apiRequest("/projects"),
        apiRequest("/boards"),
        apiRequest("/tasks")
      ]);

      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setBoards(Array.isArray(boardsData) ? boardsData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setIsAuthenticated(true);
    } catch (err: any) {
      if (err.message === 'Unauthorized') {
        setIsAuthenticated(false);
      } else {
        setError(err.message || "Failed to connect to the server.");
        setIsAuthenticated(true); // server error, but user is authed
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [...prev, newProject]);
  };

  const handleProjectDeleted = (projectId: number) => {
    setProjects((prev) => prev.filter(p => p.projectId !== projectId));
    setBoards((prev) => prev.filter(b => b.projectId !== projectId));
  };

  const handleProjectRenamed = (updatedProject: Project) => {
    setProjects((prev) => prev.map(p => p.projectId === updatedProject.projectId ? updatedProject : p));
  };

  const handleDeleteBoard = async (e: React.MouseEvent, boardId: string, projectId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this board?")) return;
    
    try {
      await apiRequest(`/boards/${boardId}?projectId=${projectId}`, {
        method: "DELETE"
      });
      setBoards(prev => prev.filter(b => b.id !== boardId));
      setTasks(prev => prev.filter(t => String(t.boardId) !== boardId));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete board.");
    }
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: "DELETE"
      });
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete task.");
    }
  };

  // Show spinner while loading OR while auth state is not yet determined
  if (loading || isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">

      <div className="mb-6 md:mb-10">
        <h1 className="text-lg md:text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4 md:mb-6">
          <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
          Your Workspace
        </h1>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 p-2.5 md:p-3 rounded-lg shadow-sm flex items-center gap-2.5 hover:border-blue-300 transition-colors">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md shrink-0">
              <FolderKanban className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider">Projects</h3>
              <p className="text-base md:text-lg font-bold text-slate-800">{projects.length}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-2.5 md:p-3 rounded-lg shadow-sm flex items-center gap-2.5 hover:border-indigo-300 transition-colors">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md shrink-0">
              <LayoutDashboard className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider">Boards</h3>
              <p className="text-base md:text-lg font-bold text-slate-800">{boards.length}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-2.5 md:p-3 rounded-lg shadow-sm flex items-center gap-2.5 hover:border-emerald-300 transition-colors">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md shrink-0">
              <CheckSquare className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider">Completed</h3>
              <p className="text-base md:text-lg font-bold text-emerald-600">{tasks.filter(t => t.status === 'DONE').length}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-2.5 md:p-3 rounded-lg shadow-sm flex items-center gap-2.5 hover:border-blue-300 transition-colors">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md shrink-0">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider">Pending</h3>
              <p className="text-base md:text-lg font-bold text-blue-600">{tasks.filter(t => t.status !== 'DONE').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 md:mb-10">
        <h2 className="text-sm md:text-lg font-bold text-slate-800 flex items-center gap-2 mb-3 md:mb-4">
          <FolderKanban className="h-4.5 w-4.5 text-slate-500" />
          Your Projects
        </h2>

        {error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.projectId}
                project={project}
                onDelete={handleProjectDeleted}
                onRename={handleProjectRenamed}
              />
            ))}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-24 bg-slate-50 hover:bg-slate-100/80 border border-dashed border-slate-300 hover:border-blue-400 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 transition-colors shadow-sm w-full"
            >
              <Plus className="h-5 w-5 mb-0.5" />
              <span className="text-xs font-semibold">Create Project</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <LayoutDashboard className="h-5 w-5 text-slate-500" />
            Your Boards
          </h2>

          {!error && boards.length === 0 && (
            <div className="text-sm text-slate-500 italic bg-white/50 border border-slate-200 p-8 rounded-2xl text-center flex flex-col items-center justify-center">
              <LayoutDashboard className="h-8 w-8 text-slate-300 mb-2" />
              No boards found. Open a project to create one.
            </div>
          )}

          {!error && boards.length > 0 && (
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {boards.map((board) => {
                const project = projects.find(p => String(p.projectId) === String(board.projectId));
                return (
                  <div key={board.id} className="relative group/item">
                    <Link href={`/board/${board.id}`}>
                      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between group-hover/item:pr-12">
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm group-hover/item:text-indigo-600 transition-colors truncate">
                            {board.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <FolderKanban className="h-3 w-3" />
                            {project?.projectName || 'Uncategorized'}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => handleDeleteBoard(e, board.id, board.projectId)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-600 opacity-100 md:opacity-0 md:group-hover/item:opacity-100 transition-opacity rounded-full hover:bg-red-50 z-10"
                      title="Delete Board"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <CheckSquare className="h-5 w-5 text-slate-500" />
            Recent Tasks
          </h2>

          {!error && tasks.length === 0 && (
            <div className="text-sm text-slate-500 italic bg-white/50 border border-slate-200 p-8 rounded-2xl text-center flex flex-col items-center justify-center">
              <CheckSquare className="h-8 w-8 text-slate-300 mb-2" />
              No tasks found. Create tasks inside a board.
            </div>
          )}

          {!error && tasks.length > 0 && (
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {tasks.map((task) => {
                const board = boards.find(b => String(b.id) === String(task.boardId));
                const estimatedStr = task.timeSetByUser ? `${task.timeSetByUser}m` : null;
                
                // Parse actual time in seconds
                let actualStr = null;
                if (task.timeTakenByUser) {
                   const totalSeconds = parseInt(task.timeTakenByUser, 10);
                   if (!isNaN(totalSeconds) && totalSeconds > 0) {
                     const m = Math.floor(totalSeconds / 60);
                     const s = totalSeconds % 60;
                     actualStr = `${m}m ${s}s`;
                   }
                }

                return (
                  <div key={task.id} className="relative group/item">
                    <Link href={`/board/${task.boardId}`}>
                      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between group-hover/item:pr-12">
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 mt-1.5 w-2.5 h-2.5 rounded-full shadow-inner ${task.status === 'DONE' ? 'bg-emerald-500' : task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                          <div>
                            <h3 className={`font-semibold text-slate-800 text-sm transition-colors truncate ${task.status === 'DONE' ? 'line-through text-slate-400' : 'group-hover/item:text-blue-600'}`}>
                              {task.taskName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <LayoutDashboard className="h-3 w-3" />
                                {board?.name || 'Uncategorized'}
                              </p>
                              
                              {(estimatedStr || actualStr) && (
                                <div className="flex items-center gap-1.5 text-[9px] bg-slate-100/80 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                                  <Clock className="h-2.5 w-2.5 text-slate-400" />
                                  {actualStr && <span>Act: <span className="text-slate-800">{actualStr}</span></span>}
                                  {estimatedStr && <span>Est: <span className="text-slate-800">{estimatedStr}</span></span>}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => handleDeleteTask(e, task.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-600 opacity-100 md:opacity-0 md:group-hover/item:opacity-100 transition-opacity rounded-full hover:bg-red-50 z-10"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <QuoteCarousel />

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
}

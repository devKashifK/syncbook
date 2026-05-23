'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Clock, Loader2, FolderKanban, LayoutDashboard, CheckSquare, Workflow, Trash2 } from "lucide-react";
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
};

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const headers = { "Authorization": `Bearer ${token}` };

      const [projectsRes, boardsRes, tasksRes] = await Promise.all([
        fetch("http://localhost:8092/api/projects", { headers }),
        fetch("http://localhost:8092/api/boards", { headers }),
        fetch("http://localhost:8092/api/tasks", { headers })
      ]);

      if (projectsRes.status === 401 || boardsRes.status === 401 || tasksRes.status === 401) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const projectsData = await projectsRes.json();
      const boardsData = await boardsRes.json();
      const tasksData = await tasksRes.json();

      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setBoards(Array.isArray(boardsData) ? boardsData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err: any) {
      setError(err.message || "Failed to connect to the server.");
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
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8092/api/boards/${boardId}?projectId=${projectId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setBoards(prev => prev.filter(b => b.id !== boardId));
        setTasks(prev => prev.filter(t => String(t.boardId) !== boardId));
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to delete board.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while deleting board.");
    }
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this task?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8092/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to delete task.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while deleting task.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return null;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">

      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <LayoutDashboard className="h-6 w-6 text-blue-600" />
          Your Workspace
        </h1>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-blue-300 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FolderKanban className="h-16 w-16" />
            </div>
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Projects</h3>
            <p className="text-3xl font-extrabold text-slate-800">{projects.length}</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-indigo-300 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <LayoutDashboard className="h-16 w-16" />
            </div>
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Boards</h3>
            <p className="text-3xl font-extrabold text-slate-800">{boards.length}</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-emerald-300 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <CheckSquare className="h-16 w-16 text-emerald-600" />
            </div>
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Completed</h3>
            <p className="text-3xl font-extrabold text-emerald-600">{tasks.filter(t => t.status === 'DONE').length}</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-blue-300 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Clock className="h-16 w-16 text-blue-600" />
            </div>
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Pending</h3>
            <p className="text-3xl font-extrabold text-blue-600">{tasks.filter(t => t.status !== 'DONE').length}</p>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <FolderKanban className="h-5 w-5 text-slate-500" />
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
              className="h-32 bg-blue-50/50 hover:bg-blue-50 border-2 border-dashed border-blue-200 hover:border-blue-300 rounded-2xl flex flex-col items-center justify-center text-blue-600 hover:text-blue-700 transition-colors shadow-sm"
            >
              <Plus className="h-6 w-6 mb-1" />
              <span className="text-sm font-semibold">Create Project</span>
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
            <div className="flex flex-col gap-3">
              {boards.slice(0, 5).map((board) => {
                const project = projects.find(p => String(p.projectId) === String(board.projectId));
                return (
                  <div key={board.id} className="relative group/item">
                    <Link href={`/board/${board.id}`}>
                      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between group-hover/item:pr-12">
                        <div>
                          <h3 className="font-semibold text-slate-800 group-hover/item:text-indigo-600 transition-colors truncate">
                            {board.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <FolderKanban className="h-3 w-3" />
                            {project?.projectName || 'Uncategorized'}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => handleDeleteBoard(e, board.id, board.projectId)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-600 opacity-0 group-hover/item:opacity-100 transition-opacity rounded-full hover:bg-red-50 z-10"
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
            <div className="flex flex-col gap-3">
              {tasks.slice(0, 5).map((task) => {
                const board = boards.find(b => String(b.id) === String(task.boardId));
                return (
                  <div key={task.id} className="relative group/item">
                    <Link href={`/board/${task.boardId}`}>
                      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between group-hover/item:pr-12">
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-3 h-3 rounded-full shadow-inner ${task.status === 'DONE' ? 'bg-emerald-500' : task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                          <div>
                            <h3 className={`font-semibold text-slate-800 transition-colors truncate ${task.status === 'DONE' ? 'line-through text-slate-400' : 'group-hover/item:text-blue-600'}`}>
                              {task.taskName}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <LayoutDashboard className="h-3 w-3" />
                              {board?.name || 'Uncategorized'}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => handleDeleteTask(e, task.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-600 opacity-0 group-hover/item:opacity-100 transition-opacity rounded-full hover:bg-red-50 z-10"
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

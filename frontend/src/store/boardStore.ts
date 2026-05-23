import { create } from 'zustand';
import { toast } from 'sonner';

export type Task = {
  id: string;
  title: string;
  description: string;
  columnId: string;
  timer: number;
  estimatedTime: number;
  actualTime: number;
  timerStatus: 'idle' | 'running' | 'completed';
  timerStartTime?: number;
};

export type Column = {
  id: string;
  title: string;
};

export type Board = {
  id: string;
  title: string;
  columns: Column[];
  tasks: Task[];
};

type BoardState = {
  boards: Board[];
  activeBoardId: string | null;
  activeTimerTaskId: string | null;
  setActiveBoard: (id: string) => void;
  // ASYNC ACTIONS
  fetchAllBoards: () => Promise<void>;
  fetchTasks: (boardId: string) => Promise<void>;
  addTask: (boardId: string, columnId: string, title: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, newColumnId: string, newIndex: number) => Promise<void>;
  startTimer: (taskId: string) => void;
  endTimer: (taskId: string) => void;
  tickTimer: (taskId: string) => void;
};

export const defaultColumns: Column[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'in-review', title: 'In Review' },
  { id: 'done', title: 'Done' },
];

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  activeBoardId: null,
  activeTimerTaskId: null,
  
  setActiveBoard: (id) => set({ activeBoardId: id }),

  fetchAllBoards: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8092/api/boards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        set((state) => {
          const newBoards = [...state.boards];
          data.forEach((serverBoard: any) => {
            const existing = newBoards.find(b => b.id === serverBoard.id);
            if (existing) {
              existing.title = serverBoard.name;
            } else {
              newBoards.push({
                id: serverBoard.id,
                title: serverBoard.name,
                columns: defaultColumns,
                tasks: []
              });
            }
          });
          return { boards: newBoards };
        });
      }
    } catch (err) {
      console.error("Failed to fetch all boards", err);
    }
  },
  
  fetchTasks: async (boardId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const res = await fetch(`http://localhost:8092/api/tasks/board/${boardId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const text = await res.text();
      let data = [];
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse tasks response:", text);
        }
      }
      
      let fetchedTasks: Task[] = [];
      if (Array.isArray(data)) {
         fetchedTasks = data.map((t: any) => ({
           id: String(t.id),
           title: t.taskName || '',
           description: t.description || '',
           columnId: t.status || 'todo',
           timer: 0,
           estimatedTime: t.timeSetByUser ? parseInt(t.timeSetByUser) : 0,
           actualTime: t.timeTakenByUser ? parseInt(t.timeTakenByUser) : 0,
           timerStatus: 'idle'
         }));
      }

      set((state) => {
        const existingBoard = state.boards.find(b => b.id === boardId);
        if (existingBoard) {
          const newBoards = state.boards.map(b => b.id === boardId ? { ...b, tasks: fetchedTasks } : b);
          return { boards: newBoards };
        } else {
          return {
            boards: [...state.boards, {
              id: boardId,
              title: 'Board', // Title updated separately by page
              columns: defaultColumns,
              tasks: fetchedTasks
            }]
          }
        }
      });
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  },

  addTask: async (boardId, columnId, title) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8092/api/tasks/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          boardId,
          taskName: title,
          status: columnId,
          description: '',
          timeSetByUser: '0'
        })
      });
      
      if (!res.ok) throw new Error('Failed to create task');
      
      const t = await res.json();
      const newTask: Task = {
        id: String(t.id),
        title: t.taskName,
        description: t.description || '',
        columnId: t.status,
        timer: 0,
        estimatedTime: t.timeSetByUser ? parseInt(t.timeSetByUser) : 0,
        actualTime: t.timeTakenByUser ? parseInt(t.timeTakenByUser) : 0,
        timerStatus: 'idle'
      };

      set((state) => {
        const newBoards = state.boards.map(b => b.id === boardId ? { ...b, tasks: [...b.tasks, newTask] } : b);
        return { boards: newBoards };
      });
    } catch (err) {
      toast.error('Failed to add task');
    }
  },
  
  updateTask: async (taskId, updates) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Optimistic update
    set((state) => {
      const newBoards = state.boards.map(board => ({
        ...board,
        tasks: board.tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      }));
      return { boards: newBoards };
    });

    try {
      const payload: any = {};
      if (updates.title !== undefined) payload.taskName = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.estimatedTime !== undefined) payload.timeSetByUser = String(updates.estimatedTime);
      if (updates.actualTime !== undefined) payload.timeTakenByUser = String(updates.actualTime);

      if (Object.keys(payload).length > 0) {
        await fetch(`http://localhost:8092/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }
    } catch (err) {
      toast.error('Failed to save task updates');
    }
  },
  
  deleteTask: async (taskId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Optimistic update
    set((state) => {
      const newBoards = state.boards.map(board => ({
        ...board,
        tasks: board.tasks.filter(task => task.id !== taskId)
      }));
      return { 
        boards: newBoards,
        activeTimerTaskId: state.activeTimerTaskId === taskId ? null : state.activeTimerTaskId
      };
    });

    try {
      await fetch(`http://localhost:8092/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      toast.error('Failed to delete task');
    }
  },
  
  moveTask: async (taskId, newColumnId, newIndex) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Optimistic update
    set((state) => {
      const newBoards = state.boards.map(board => {
        const tasks = [...board.tasks];
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
          const [task] = tasks.splice(taskIndex, 1);
          task.columnId = newColumnId;
          
          const columnTasks = tasks.filter(t => t.columnId === newColumnId);
          
          if (columnTasks.length > 0) {
              let insertAt = 0;
              let currentColumnIndex = 0;
              for (let i = 0; i < tasks.length; i++) {
                  if (tasks[i].columnId === newColumnId) {
                      if (currentColumnIndex === newIndex) {
                          insertAt = i;
                          break;
                      }
                      currentColumnIndex++;
                  }
                  insertAt = i + 1;
              }
              tasks.splice(insertAt, 0, task);
          } else {
               tasks.push(task);
          }
  
          return { ...board, tasks };
        }
        return board;
      });
      return { boards: newBoards };
    });

    try {
      await fetch(`http://localhost:8092/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newColumnId })
      });
    } catch (err) {
      toast.error('Failed to move task');
    }
  },

  startTimer: (taskId) => set((state) => {
    let activeTaskToStop = null;
    if (state.activeTimerTaskId && state.activeTimerTaskId !== taskId) {
      activeTaskToStop = state.activeTimerTaskId;
    }

    const newBoards = state.boards.map(board => ({
      ...board,
      tasks: board.tasks.map(task => {
        if (task.id === activeTaskToStop) return { ...task, timerStatus: 'idle', timerStartTime: undefined };
        if (task.id === taskId) return { ...task, timerStatus: 'running', timerStartTime: Date.now() };
        return task;
      })
    }));

    return { boards: newBoards, activeTimerTaskId: taskId };
  }),

  tickTimer: (taskId) => set((state) => {
    const newBoards = state.boards.map(board => ({
      ...board,
      tasks: board.tasks.map(task => {
        if (task.id === taskId && task.timerStatus === 'running' && task.timerStartTime) {
          return { ...task, actualTime: task.actualTime + 1 };
        }
        return task;
      })
    }));
    return { boards: newBoards };
  }),

  endTimer: (taskId) => set((state) => {
    let taskToEnd: Task | undefined;
    const newBoards = state.boards.map(board => ({
      ...board,
      tasks: board.tasks.map(task => {
        if (task.id === taskId) {
          taskToEnd = { ...task, timerStatus: 'completed', timerStartTime: undefined };
          return taskToEnd;
        }
        return task;
      })
    }));

    if (taskToEnd) {
      const actualMinutes = taskToEnd.actualTime / 60;
      if (taskToEnd.estimatedTime > 0) {
        if (actualMinutes < taskToEnd.estimatedTime) {
          toast.success(`Task completed early!`, {
            description: `Finished in ${Math.round(actualMinutes)} min. Estimated: ${taskToEnd.estimatedTime} min.`,
          });
        } else {
          toast.warning(`Task completed late.`, {
            description: `Finished in ${Math.round(actualMinutes)} min. Estimated: ${taskToEnd.estimatedTime} min.`,
          });
        }
      } else {
        toast.info(`Task completed.`, {
          description: `Total time: ${Math.round(actualMinutes)} min.`
        });
      }
      
      const token = localStorage.getItem('token');
      if (token && taskToEnd) {
        fetch(`http://localhost:8092/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ timeTakenByUser: String(taskToEnd.actualTime) })
        }).catch(() => console.error("Failed to save timer data"));
      }
    }

    return { 
      boards: newBoards,
      activeTimerTaskId: state.activeTimerTaskId === taskId ? null : state.activeTimerTaskId
    };
  }),

}));

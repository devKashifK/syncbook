'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Task, useBoardStore } from '../../store/boardStore';
import { Clock, AlignLeft, Trash2, Play, Square, GripVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import TaskModal from './TaskModal';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { cn } from '../../lib/utils';
import { Icon } from '@iconify/react';

// Module-level cache to prevent duplicate fetches and rate-limiting
const iconCache = new Map<string, string>();
const fetchingCache = new Map<string, Promise<string>>();

const getIconForTitle = async (title: string): Promise<string> => {
  // Extract a meaningful keyword from the title
  const words = title.split(/[\s,.-]+/).filter(w => w.length >= 3 && !['the', 'and', 'for', 'with'].includes(w.toLowerCase()));
  const keyword = words.length > 0 ? words[0].toLowerCase() : 'task';

  if (iconCache.has(keyword)) return iconCache.get(keyword)!;
  if (fetchingCache.has(keyword)) return fetchingCache.get(keyword)!;

  const promise = fetch(`https://api.iconify.design/search?query=${keyword}&limit=1`)
    .then(res => res.json())
    .then(data => {
      let icon = 'lucide:circle-dashed'; // fallback
      if (data.icons && data.icons.length > 0) {
        icon = data.icons[0];
      }
      iconCache.set(keyword, icon);
      return icon;
    })
    .catch(() => 'lucide:circle-dashed');

  fetchingCache.set(keyword, promise);
  return promise;
};

export default function TaskCard({ task, index }: { task: Task; index: number }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [iconName, setIconName] = useState<string>('lucide:circle-dashed');

  const deleteTask = useBoardStore(state => state.deleteTask);
  const startTimer = useBoardStore(state => state.startTimer);
  const endTimer = useBoardStore(state => state.endTimer);

  useEffect(() => {
    let mounted = true;
    getIconForTitle(task.title).then(icon => {
      if (mounted) setIconName(icon);
    });
    return () => { mounted = false; };
  }, [task.title]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
    setIsAlertOpen(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAlertOpen(false);
  };

  const handleToggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.timerStatus === 'running') {
      endTimer(task.id);
    } else {
      startTimer(task.id);
    }
  };

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const m = Math.floor(totalSeconds / 60);
    return `${m}m`;
  };

  const isRunning = task.timerStatus === 'running';

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="group relative"
            onClick={() => setIsModalOpen(true)}
            style={{
              ...provided.draggableProps.style,
              transform: snapshot.isDragging
                ? `${provided.draggableProps.style?.transform} rotate(3deg)`
                : provided.draggableProps.style?.transform,
            }}
          >
            {/* Glowing border if running */}
            {isRunning && (
              <div className="absolute -inset-0.5 bg-emerald-500 rounded-lg blur opacity-30 animate-pulse"></div>
            )}

            <div
              className={cn(
                "relative shadow-sm cursor-pointer border border-slate-200 hover:border-blue-400 hover:shadow transition-all rounded-lg bg-white p-2 flex items-center justify-between gap-2 w-full",
                snapshot.isDragging && "shadow-md border-blue-500",
                isRunning && "border-emerald-400 bg-emerald-50/10 shadow-emerald-500/10"
              )}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <GripVertical className="h-3.5 w-3.5 text-slate-300 shrink-0 cursor-grab active:cursor-grabbing" />
                <Icon icon={iconName} className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-slate-700 block truncate leading-snug">
                    {task.title}
                  </span>

                  {(task.description || task.actualTime > 0 || task.estimatedTime > 0 || isRunning) && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {task.description && (
                        <AlignLeft className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                      )}
                      {(task.actualTime > 0 || task.estimatedTime > 0 || isRunning) && (
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[9px] px-1 py-0.5 rounded font-mono font-medium",
                          isRunning ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600",
                          task.timerStatus === 'completed' && task.actualTime / 60 > task.estimatedTime && task.estimatedTime > 0 ? "bg-orange-100 text-orange-700" : ""
                        )}>
                          <Clock className="h-2.5 w-2.5" />
                          {formatTime(task.actualTime)}
                          {task.estimatedTime > 0 && `/${task.estimatedTime}m`}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-0.5 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-6 w-6 shrink-0 rounded", isRunning ? "text-red-500 hover:bg-red-50" : "text-emerald-500 hover:bg-emerald-50")}
                  onClick={handleToggleTimer}
                  title={isRunning ? "End Timer" : "Start Timer"}
                >
                  {isRunning ? <Square className="h-2.5 w-2.5 fill-current" /> : <Play className="h-2.5 w-2.5 fill-current" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500 shrink-0 rounded" onClick={handleDeleteClick}>
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      <TaskModal
        task={task}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task &quot;{task.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

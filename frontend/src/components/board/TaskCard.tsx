'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Task, useBoardStore } from '../../store/boardStore';
import { Card, CardContent } from '../ui/card';
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
            
            <Card
              className={cn(
                "relative shadow-sm cursor-pointer border-slate-200 hover:border-blue-300 transition-colors overflow-hidden",
                snapshot.isDragging && "shadow-lg border-blue-400",
                isRunning && "border-emerald-400 shadow-emerald-500/20 shadow-sm"
              )}
            >
              <CardContent className="p-2.5">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2 items-start">
                    <GripVertical className="h-4 w-4 text-slate-300 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                    <Icon icon={iconName} className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-800 font-medium leading-tight pr-6 ml-1">
                      {task.title}
                    </p>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("h-6 w-6", isRunning ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50")}
                      onClick={handleToggleTimer}
                      title={isRunning ? "End Timer" : "Start Timer"}
                    >
                      {isRunning ? <Square className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={handleDeleteClick}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-500 text-xs">
                  {task.description && (
                    <div className="flex items-center gap-1" title="Has description">
                      <AlignLeft className="h-3 w-3" />
                    </div>
                  )}
                  {(task.actualTime > 0 || task.estimatedTime > 0 || isRunning) && (
                    <div className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors",
                      isRunning ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600",
                      task.timerStatus === 'completed' && task.actualTime / 60 > task.estimatedTime && task.estimatedTime > 0 ? "bg-orange-100 text-orange-700" : ""
                    )}>
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatTime(task.actualTime)}
                        {task.estimatedTime > 0 && ` / ${task.estimatedTime}m`}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
              This action cannot be undone. This will permanently delete the task "{task.title}".
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

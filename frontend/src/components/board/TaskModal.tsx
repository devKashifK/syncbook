'use client';

import { Task, useBoardStore } from '../../store/boardStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { Clock, AlignLeft, LayoutTemplate, Play, Square, Save } from 'lucide-react';
import { cn } from '../../lib/utils';

type TaskModalProps = {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
};

export default function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
  const updateTask = useBoardStore(state => state.updateTask);
  const startTimer = useBoardStore(state => state.startTimer);
  const endTimer = useBoardStore(state => state.endTimer);
  
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [estimatedTime, setEstimatedTime] = useState(task.estimatedTime?.toString() || '0');

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setEstimatedTime(task.estimatedTime?.toString() || '0');
  }, [task.title, task.description, task.estimatedTime]);

  const handleSave = () => {
    updateTask(task.id, {
      title,
      description,
      estimatedTime: parseInt(estimatedTime, 10) || 0,
    });
    onClose();
  };

  const handleToggleTimer = () => {
    updateTask(task.id, {
      estimatedTime: parseInt(estimatedTime, 10) || 0,
    });
    
    if (task.timerStatus === 'running') {
      endTimer(task.id);
    } else {
      startTimer(task.id);
    }
  };

  const formatActualTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] bg-white p-0 overflow-hidden border-0 shadow-2xl rounded-xl">
        {/* Header Section */}
        <div className="px-5 pt-5 pb-2">
          <DialogHeader>
            <div className="flex items-start gap-3 w-full pr-8">
              <LayoutTemplate className="h-5 w-5 mt-1 text-slate-400 shrink-0" />
              <div className="w-full">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-bold text-slate-800 border-transparent shadow-none bg-transparent hover:bg-slate-100 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-2 -ml-2 h-auto py-1 transition-all"
                />
                <p className="text-xs text-slate-500 mt-0.5 ml-1">
                  in list <span className="font-semibold underline underline-offset-2 decoration-slate-300">{task.columnId}</span>
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-5 pb-4 space-y-5">
          {/* Description Section */}
          <div className="flex gap-3">
            <AlignLeft className="h-5 w-5 text-slate-400 shrink-0" />
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center">Description</h3>
              <Textarea
                placeholder="Add a more detailed description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] resize-none bg-slate-50/50 border-slate-200 hover:bg-slate-100/50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500 transition-all rounded-lg shadow-sm text-sm py-2 px-3"
              />
            </div>
          </div>

          {/* Time Tracking Section */}
          <div className="flex gap-3">
            <Clock className="h-5 w-5 text-slate-400 shrink-0" />
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center">Time Tracking</h3>
              
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Estimate (min)</label>
                    <Input
                      type="number"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      className="w-20 h-8 bg-white border-slate-200 focus-visible:ring-blue-500 shadow-sm text-sm"
                      min="0"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Actual Time</label>
                    <div className="h-8 flex items-center px-3 bg-slate-200/50 border border-slate-200 rounded-md font-mono text-sm text-slate-700 shadow-inner">
                      {formatActualTime(task.actualTime)}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex-1">
                    <Button 
                      size="sm"
                      variant={task.timerStatus === 'running' ? 'destructive' : 'default'}
                      onClick={handleToggleTimer}
                      className={cn(
                        "gap-1.5 w-full shadow-sm transition-all h-8",
                        task.timerStatus !== 'running' && "bg-emerald-600 hover:bg-emerald-700 text-white"
                      )}
                    >
                      {task.timerStatus === 'running' ? (
                        <>
                          <Square className="h-3 w-3 fill-current" />
                          End Timer
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 fill-current" />
                          Start Timer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="px-5 py-3 bg-slate-50 border-t flex justify-end gap-2 rounded-b-xl">
          <Button size="sm" variant="ghost" onClick={onClose} className="hover:bg-slate-200 h-8">Cancel</Button>
          <Button size="sm" onClick={handleSave} className="gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-sm px-4 h-8">
            <Save className="h-3.5 w-3.5" />
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

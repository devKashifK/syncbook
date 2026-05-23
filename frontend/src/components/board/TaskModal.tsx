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
import { Clock, AlignLeft, LayoutTemplate, Play, Square } from 'lucide-react';
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
    const t = task.title;
    const d = task.description;
    const e = task.estimatedTime?.toString() || '0';
    setTimeout(() => {
      setTitle(t);
      setDescription(d);
      setEstimatedTime(e);
    }, 0);
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
      <DialogContent className="sm:max-w-[420px] bg-white p-0 overflow-hidden shadow-lg border border-slate-200 rounded-lg">
        {/* Header Section */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100">
          <DialogHeader>
            <div className="flex items-center gap-1.5 text-slate-400">
              <LayoutTemplate className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Task details
              </span>
            </div>
            <div className="mt-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-base font-bold text-slate-800 border-transparent shadow-none bg-transparent hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-blue-500 rounded-md px-1.5 -ml-1.5 h-8 py-0.5 transition-none"
              />
              <p className="text-[10px] text-slate-400 mt-0.5 ml-0.5">
                in list <span className="underline font-semibold text-slate-500 uppercase tracking-wide text-[9px]">{task.columnId}</span>
              </p>
            </div>
          </DialogHeader>
        </div>

        {/* Body Section */}
        <div className="p-5 space-y-4">
          {/* Description Section */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <AlignLeft className="h-3.5 w-3.5" />
              Description
            </h3>
            <Textarea
              placeholder="Add a more detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[70px] resize-none bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500 rounded-md text-xs py-2 px-3 shadow-none"
            />
          </div>

          {/* Time Tracking Section */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-2">
              <Clock className="h-3.5 w-3.5" />
              Time Tracking
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Estimate (m)
                </label>
                <Input
                  type="number"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className="h-8 text-xs focus-visible:ring-blue-500 w-full"
                  min="0"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Actual Time
                </label>
                <div className="h-8 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-md px-2 text-xs font-mono text-slate-700 w-full">
                  <span>{formatActualTime(task.actualTime)}</span>
                  <Button 
                    size="sm"
                    variant="ghost"
                    onClick={handleToggleTimer}
                    className={cn(
                      "h-6 px-1.5 text-[9px] font-bold flex items-center gap-1 rounded",
                      task.timerStatus === 'running' ? "text-red-600 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"
                    )}
                  >
                    {task.timerStatus === 'running' ? (
                      <>
                        <Square className="h-2.5 w-2.5 fill-current" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-2.5 w-2.5 fill-current" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="px-5 py-3 bg-slate-50 flex justify-end gap-2 border-t border-slate-200">
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-none font-semibold px-4">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

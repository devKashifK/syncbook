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
      <DialogContent className="sm:max-w-[500px] bg-white p-0 overflow-hidden shadow-lg border-slate-200 rounded-lg">
        {/* Header Section */}
        <div className="px-5 pt-5 pb-2">
          <DialogHeader>
            <div className="flex items-start gap-3 w-full pr-6">
              <LayoutTemplate className="h-5 w-5 mt-1 text-slate-500 shrink-0" />
              <div className="w-full">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-bold text-slate-800 border-transparent shadow-none bg-transparent hover:bg-slate-100 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-2 -ml-2 h-auto py-1 transition-none"
                />
                <p className="text-xs text-slate-500 mt-1 ml-1">
                  in list <span className="underline cursor-pointer">{task.columnId}</span>
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-5 pb-6 space-y-6">
          {/* Description Section */}
          <div className="flex gap-3">
            <AlignLeft className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">Description</h3>
              <Textarea
                placeholder="Add a more detailed description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] resize-none bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500 rounded-md text-sm py-2 px-3 shadow-none"
              />
            </div>
          </div>

          {/* Time Tracking Section */}
          <div className="flex gap-3">
            <Clock className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">Time Tracking</h3>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500 font-medium">Estimate (m):</label>
                  <Input
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className="w-16 h-8 text-sm focus-visible:ring-blue-500"
                    min="0"
                  />
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <label className="text-xs text-slate-500 font-medium">Actual:</label>
                  <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                    {formatActualTime(task.actualTime)}
                  </span>
                </div>
                
                <Button 
                  size="sm"
                  variant={task.timerStatus === 'running' ? 'destructive' : 'secondary'}
                  onClick={handleToggleTimer}
                  className="ml-auto h-8 text-xs font-medium"
                >
                  {task.timerStatus === 'running' ? (
                    <>
                      <Square className="h-3 w-3 mr-1.5 fill-current" />
                      Stop Timer
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1.5 fill-current" />
                      Start Timer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="px-5 py-3 bg-slate-50 flex justify-end gap-2 border-t border-slate-200">
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-sm">Cancel</Button>
          <Button size="sm" onClick={handleSave} className="h-8 text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-none">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

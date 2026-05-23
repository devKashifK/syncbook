'use client';

import { useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { Button } from '../ui/button';
import { Clock, Square } from 'lucide-react';
import { formatTimeFull } from '../../lib/format';

export default function ActiveTimerOverlay() {
  const activeTimerTaskId = useBoardStore(state => state.activeTimerTaskId);
  const boards = useBoardStore(state => state.boards);
  const endTimer = useBoardStore(state => state.endTimer);
  const tickTimer = useBoardStore(state => state.tickTimer);

  useEffect(() => {
    if (!activeTimerTaskId) return;
    const id = setInterval(() => tickTimer(activeTimerTaskId), 1000);
    return () => clearInterval(id);
  }, [activeTimerTaskId, tickTimer]);

  if (!activeTimerTaskId) return null;

  let activeTask = null;
  for (const board of boards) {
    const task = board.tasks.find(t => t.id === activeTimerTaskId);
    if (task) { activeTask = task; break; }
  }

  if (!activeTask) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-900 text-slate-50 rounded-full shadow-2xl pl-6 pr-2 py-2 flex items-center gap-6 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Recording Time</span>
            <span className="text-sm font-semibold truncate max-w-[200px]">{activeTask.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xl tabular-nums tracking-tight">
          <Clock className="h-5 w-5 text-slate-400" />
          {formatTimeFull(activeTask.actualTime)}
        </div>
        <Button
          variant="destructive" size="sm"
          className="rounded-full gap-2 px-4 shadow-lg"
          onClick={() => endTimer(activeTask.id)}
        >
          <Square className="h-4 w-4 fill-current" />
          Finish
        </Button>
      </div>
    </div>
  );
}

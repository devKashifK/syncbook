'use client';

import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Column as ColumnType, Task as TaskType, useBoardStore } from '../../store/boardStore';
import TaskCard from './TaskCard';
import { Button } from '../ui/button';
import { Plus, ListTodo, Loader, CheckCircle, Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";

type ColumnProps = {
  column: ColumnType;
  tasks: TaskType[];
  boardId: string;
};

export default function ColumnComponent({ column, tasks, boardId }: ColumnProps) {
  const addTask = useBoardStore(state => state.addTask);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  const handleAddTask = () => {
    if (taskTitle.trim()) {
      addTask(boardId, column.id, taskTitle.trim());
      setTaskTitle('');
      setIsAlertOpen(false);
    }
  };

  const getIcon = () => {
    switch (column.id) {
      case 'todo': return <ListTodo className="h-4 w-4 text-blue-500" />;
      case 'in-progress': return <Loader className="h-4 w-4 text-amber-500" />;
      case 'in-review': return <Clock className="h-4 w-4 text-purple-500" />;
      case 'done': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default: return <ListTodo className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-72 sm:w-80 shrink-0 bg-slate-100/80 shadow-sm border border-slate-200 rounded-lg flex flex-col max-h-full">
      <div className="px-3 py-2.5 sm:px-4 sm:py-3 font-semibold text-slate-700 flex items-center justify-between border-b border-slate-200/50 text-sm">
        <div className="flex items-center gap-1.5">
          {getIcon()}
          <span>{column.title}</span>
        </div>
        <span className="text-[10px] sm:text-xs bg-white text-slate-600 px-2 py-0.5 shadow-sm rounded-full border border-slate-200">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={column.id} type="task">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-2 min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200' : ''
              }`}
          >
            <div className="flex flex-col gap-2">
              {tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>

      <div className="p-1.5">
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogTrigger>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-500 hover:bg-slate-200 hover:text-slate-800 h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add a card
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add a card to {column.title}</AlertDialogTitle>
              <AlertDialogDescription>
                Enter a title for your new card.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input
                placeholder="Card title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTask();
                }}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTaskTitle('')}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => {
                e.preventDefault();
                handleAddTask();
              }}>Add</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

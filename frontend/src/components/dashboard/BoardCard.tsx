'use client';

import { useState } from "react";
import { apiRequest } from "../../lib/api";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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
import RenameBoardModal from "./RenameBoardModal";

type Board = {
  id: string;
  name: string;
  userId: string;
  projectId: number;
};

type BoardCardProps = {
  board: Board;
  onDelete: (id: string) => void;
  onRename: (board: Board) => void;
};

export default function BoardCard({ board, onDelete, onRename }: BoardCardProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiRequest(`/boards/${board.id}?projectId=${board.projectId}`, {
        method: "DELETE"
      });

      onDelete(board.id);
    } catch (err) {
      console.error(err);
      alert("Failed to delete the board. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
    }
  };

  return (
    <>
      <div className="group relative h-24 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden hover:border-blue-300 p-3">
        {/* The clickable area to navigate to the board */}
        <Link href={`/board/${board.id}`} className="absolute inset-0 z-0"></Link>
        
        <div className="relative z-10 flex justify-between items-start w-full pointer-events-auto">
          <h3 className="font-semibold text-slate-800 text-sm truncate pr-2 w-full">
            <Link href={`/board/${board.id}`} className="hover:underline focus:outline-none">
              {board.name}
            </Link>
          </h3>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => setIsRenameOpen(true)} className="text-xs">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 focus:bg-red-50 text-xs"
                onClick={() => setIsAlertOpen(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative z-10 flex items-center gap-1.5 text-[11px] text-slate-500 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              &quot;{board.name}&quot; board and all its tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Board"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RenameBoardModal 
        board={board} 
        isOpen={isRenameOpen} 
        onClose={() => setIsRenameOpen(false)} 
        onSuccess={(updatedBoard) => {
          onRename(updatedBoard);
          setIsRenameOpen(false);
        }} 
      />
    </>
  );
}

'use client';

import { useState } from "react";
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
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8092/api/boards/${board.id}?projectId=${board.projectId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete board");
      }

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
      <div className="group relative h-28 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden before:absolute before:inset-0 before:bg-blue-600/5 hover:before:bg-blue-600/10 hover:border-blue-300">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
        
        {/* The clickable area to navigate to the board */}
        <Link href={`/board/${board.id}`} className="absolute inset-0 z-0"></Link>
        
        <div className="relative z-10 p-4 flex justify-between items-start pointer-events-none">
          <h3 className="font-bold text-slate-800 truncate pr-6 pointer-events-auto w-full">
            <Link href={`/board/${board.id}`} className="hover:underline focus:outline-none">
              {board.name}
            </Link>
          </h3>
          
          <div className="pointer-events-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={() => setIsAlertOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="relative z-10 px-4 pb-4 flex items-center gap-2 text-xs text-slate-500 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              "{board.name}" board and all its tasks.
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

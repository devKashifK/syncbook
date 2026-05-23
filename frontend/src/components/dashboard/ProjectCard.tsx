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
import RenameProjectModal from "./RenameProjectModal";

export type Project = {
  projectId: number;
  projectName: string;
  projectDescription: string;
  userId: string;
};

type ProjectCardProps = {
  project: Project;
  onDelete: (id: number) => void;
  onRename: (project: Project) => void;
};

export default function ProjectCard({ project, onDelete, onRename }: ProjectCardProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiRequest(`/projects/${project.projectId}`, {
        method: "DELETE"
      });

      onDelete(project.projectId);
    } catch (err) {
      console.error(err);
      alert("Failed to delete the project. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
    }
  };

  return (
    <>
      <div className="group relative h-24 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden hover:border-blue-300 p-3">
        {/* The clickable area to navigate to the project */}
        <Link href={`/project/${project.projectId}`} className="absolute inset-0 z-0"></Link>
        
        <div className="relative z-10 flex justify-between items-start w-full pointer-events-auto">
          <h3 className="font-semibold text-slate-800 text-sm truncate pr-2 w-full">
            <Link href={`/project/${project.projectId}`} className="hover:underline focus:outline-none">
              {project.projectName}
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
        
        <p className="relative z-10 text-xs text-slate-500 line-clamp-2 pr-2 pointer-events-none">
          {project.projectDescription || "No description provided."}
        </p>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              &quot;{project.projectName}&quot; project and all its boards and tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RenameProjectModal 
        project={project} 
        isOpen={isRenameOpen} 
        onClose={() => setIsRenameOpen(false)} 
        onSuccess={(updatedProject) => {
          onRename(updatedProject);
          setIsRenameOpen(false);
        }} 
      />
    </>
  );
}

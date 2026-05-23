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
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8092/api/projects/${project.projectId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

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
      <div className="group relative h-32 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden before:absolute before:inset-0 before:bg-indigo-600/5 hover:before:bg-indigo-600/10 hover:border-indigo-300">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
        
        {/* The clickable area to navigate to the project */}
        <Link href={`/project/${project.projectId}`} className="absolute inset-0 z-0"></Link>
        
        <div className="relative z-10 p-4 flex justify-between items-start pointer-events-none h-full flex-col">
          <div className="flex justify-between items-start w-full pointer-events-auto">
            <h3 className="font-bold text-slate-800 truncate pr-2 w-full">
              <Link href={`/project/${project.projectId}`} className="hover:underline focus:outline-none">
                {project.projectName}
              </Link>
            </h3>
            
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
          
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 pr-6">
            {project.projectDescription || "No description provided."}
          </p>
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              "{project.projectName}" project and all its boards and tasks.
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

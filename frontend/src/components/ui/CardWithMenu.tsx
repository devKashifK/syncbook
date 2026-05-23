'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';

type CardWithMenuProps = {
  href: string;
  title: string;
  subtitle?: React.ReactNode;
  onRename: () => void;
  onDelete: () => Promise<void>;
  deleteDescription: string;
};

export default function CardWithMenu({
  href,
  title,
  subtitle,
  onRename,
  onDelete,
  deleteDescription,
}: CardWithMenuProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
    }
  };

  return (
    <>
      <div className="group relative h-24 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden hover:border-blue-300 p-3">
        <Link href={href} className="absolute inset-0 z-0" />
        <div className="relative z-10 flex justify-between items-start w-full pointer-events-auto">
          <h3 className="font-semibold text-slate-800 text-sm truncate pr-2 w-full">
            <Link href={href} className="hover:underline focus:outline-none">
              {title}
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
              <DropdownMenuItem onClick={onRename} className="text-xs">
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
        {subtitle && (
          <div className="relative z-10 pointer-events-none">{subtitle}</div>
        )}
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

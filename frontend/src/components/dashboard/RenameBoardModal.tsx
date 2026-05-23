'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type Board = {
  id: string;
  name: string;
  userId: string;
  projectId: number;
};

type RenameBoardModalProps = {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (board: Board) => void;
};

export default function RenameBoardModal({ board, isOpen, onClose, onSuccess }: RenameBoardModalProps) {
  const [name, setName] = useState(board.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const n = board.name;
    setTimeout(() => {
      setName(n);
    }, 0);
  }, [board.name, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === board.name) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please log in again.");

      const response = await fetch(`http://localhost:8092/api/boards/${board.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: name.trim(),
          projectId: String(board.projectId)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rename board');
      }

      onSuccess(data.board);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename board</DialogTitle>
            <DialogDescription>
              Enter a new name for your board.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            {error && (
              <div className="mb-4 p-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-red-200">
                ⚠️ {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="rename-board" className="text-sm font-medium leading-none">
                Board Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="rename-board"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || name.trim() === board.name || loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Renaming..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

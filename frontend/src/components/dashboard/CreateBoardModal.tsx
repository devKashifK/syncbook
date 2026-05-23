'use client';

import { useState } from 'react';
import { apiRequest } from '../../lib/api';
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

type CreateBoardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (board: any) => void;
  projectId: number;
};

export default function CreateBoardModal({ isOpen, onClose, onSuccess, projectId }: CreateBoardModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest('/boards', {
        method: 'POST',
        body: JSON.stringify({ 
          name: name.trim(),
          projectId: String(projectId)
        })
      });

      // data contains { message: "...", board: { id, name, userId } }
      onSuccess(data.board);
      setName('');
      onClose();
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
            <DialogTitle>Create new board</DialogTitle>
            <DialogDescription>
              A board is made up of cards ordered on lists. Use it to manage projects, track information, or organize anything.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            {error && (
              <div className="mb-4 p-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-red-200">
                ⚠️ {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="board-name" className="text-sm font-medium leading-none">
                Board Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="board-name"
                placeholder="e.g. Marketing Project"
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
            <Button type="submit" disabled={!name.trim() || loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

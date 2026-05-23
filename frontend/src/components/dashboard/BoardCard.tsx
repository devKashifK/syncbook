'use client';

import { useState } from 'react';
import { apiRequest } from '../../lib/api';
import CardWithMenu from '../ui/CardWithMenu';
import RenameBoardModal from './RenameBoardModal';

type Board = { id: string; name: string; userId: string; projectId: number };

type Props = {
  board: Board;
  onDelete: (id: string) => void;
  onRename: (board: Board) => void;
};

export default function BoardCard({ board, onDelete, onRename }: Props) {
  const [isRenameOpen, setIsRenameOpen] = useState(false);

  const handleDelete = async () => {
    await apiRequest(`/boards/${board.id}?projectId=${board.projectId}`, { method: 'DELETE' });
    onDelete(board.id);
  };

  return (
    <>
      <CardWithMenu
        href={`/board/${board.id}`}
        title={board.name}
        subtitle={
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </div>
        }
        onRename={() => setIsRenameOpen(true)}
        onDelete={handleDelete}
        deleteDescription={`This action cannot be undone. This will permanently delete the "${board.name}" board and all its tasks.`}
      />
      <RenameBoardModal
        board={board}
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        onSuccess={(updated) => { onRename(updated); setIsRenameOpen(false); }}
      />
    </>
  );
}

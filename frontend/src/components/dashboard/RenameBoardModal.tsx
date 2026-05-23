'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import FormDialog from '../ui/FormDialog';

type Board = { id: string; name: string; userId: string; projectId: number };

type Props = {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (board: Board) => void;
};

const FIELDS = [
  { id: 'name', label: 'Board Title', required: true, type: 'input' as const },
];

export default function RenameBoardModal({ board, isOpen, onClose, onSuccess }: Props) {
  const [values, setValues] = useState({ name: board.name });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setValues({ name: board.name }), 0);
  }, [board.name, isOpen]);

  const handleChange = (id: string, value: string) => setValues(v => ({ ...v, [id]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim() || values.name.trim() === board.name) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/boards/${board.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: values.name.trim(), projectId: String(board.projectId) }),
      });
      onSuccess(data.board);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Rename board"
      description="Enter a new name for your board."
      fields={FIELDS}
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Save changes"
      isLoading={loading}
      error={error}
      disabled={!values.name.trim() || values.name.trim() === board.name}
    />
  );
}

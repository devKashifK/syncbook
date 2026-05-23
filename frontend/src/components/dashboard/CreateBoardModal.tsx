'use client';

import { useState } from 'react';
import { apiRequest } from '../../lib/api';
import FormDialog from '../ui/FormDialog';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (board: any) => void;
  projectId: number;
};

const FIELDS = [
  { id: 'name', label: 'Board Title', placeholder: 'e.g. Marketing Project', required: true, type: 'input' as const },
];

export default function CreateBoardModal({ isOpen, onClose, onSuccess, projectId }: Props) {
  const [values, setValues] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (id: string, value: string) => setValues(v => ({ ...v, [id]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/boards', {
        method: 'POST',
        body: JSON.stringify({ name: values.name.trim(), projectId: String(projectId) }),
      });
      onSuccess(data.board);
      setValues({ name: '' });
      onClose();
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
      title="Create new board"
      description="A board is made up of cards ordered on lists. Use it to manage projects, track information, or organize anything."
      fields={FIELDS}
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Create Board"
      isLoading={loading}
      error={error}
      disabled={!values.name.trim()}
    />
  );
}

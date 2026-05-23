'use client';

import { useState } from 'react';
import { apiRequest } from '../../lib/api';
import FormDialog from '../ui/FormDialog';
import { Project } from './ProjectCard';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: Project) => void;
};

const FIELDS = [
  { id: 'projectName', label: 'Project name', placeholder: 'e.g. Q3 Roadmap', required: true, type: 'input' as const },
  { id: 'projectDescription', label: 'Description (optional)', placeholder: 'Briefly describe this project...', type: 'textarea' as const },
];

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: Props) {
  const [values, setValues] = useState({ projectName: '', projectDescription: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (id: string, value: string) => setValues(v => ({ ...v, [id]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!values.projectName.trim()) { setError('Project name is required'); return; }
    setIsLoading(true);
    try {
      const data = await apiRequest('/projects/create', {
        method: 'POST',
        body: JSON.stringify({ projectName: values.projectName.trim(), projectDescription: values.projectDescription.trim() }),
      });
      onSuccess(data);
      setValues({ projectName: '', projectDescription: '' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Give your new project a name and optional description to get started."
      fields={FIELDS}
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Create Project"
      isLoading={isLoading}
      error={error}
      disabled={!values.projectName.trim()}
    />
  );
}

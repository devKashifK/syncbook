'use client';

import { useState } from 'react';
import { apiRequest } from '../../lib/api';
import FormDialog from '../ui/FormDialog';
import { Project } from './ProjectCard';

type Props = {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Project) => void;
};

const FIELDS = [
  { id: 'projectName', label: 'Project name', placeholder: 'e.g. Marketing Campaign Q3', required: true, type: 'input' as const },
  { id: 'projectDescription', label: 'Description (optional)', placeholder: 'Briefly describe this project...', type: 'textarea' as const },
];

export default function RenameProjectModal({ project, isOpen, onClose, onSuccess }: Props) {
  const [values, setValues] = useState({ projectName: project.projectName, projectDescription: project.projectDescription || '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (id: string, value: string) => setValues(v => ({ ...v, [id]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!values.projectName.trim()) { setError('Project name cannot be empty'); return; }
    setIsLoading(true);
    try {
      const data = await apiRequest(`/projects/${project.projectId}`, {
        method: 'PUT',
        body: JSON.stringify({ projectName: values.projectName.trim(), projectDescription: values.projectDescription.trim() }),
      });
      onSuccess(data);
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
      title="Edit Project"
      description="Update your project's details here."
      fields={FIELDS}
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Save changes"
      isLoading={isLoading}
      error={error}
      disabled={!values.projectName.trim()}
    />
  );
}

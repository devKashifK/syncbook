'use client';

import { useState } from 'react';
import { apiRequest } from '../../lib/api';
import CardWithMenu from '../ui/CardWithMenu';
import RenameProjectModal from './RenameProjectModal';

export type Project = {
  projectId: number;
  projectName: string;
  projectDescription: string;
  userId: string;
};

type Props = {
  project: Project;
  onDelete: (id: number) => void;
  onRename: (project: Project) => void;
};

export default function ProjectCard({ project, onDelete, onRename }: Props) {
  const [isRenameOpen, setIsRenameOpen] = useState(false);

  const handleDelete = async () => {
    await apiRequest(`/projects/${project.projectId}`, { method: 'DELETE' });
    onDelete(project.projectId);
  };

  return (
    <>
      <CardWithMenu
        href={`/project/${project.projectId}`}
        title={project.projectName}
        subtitle={
          <p className="text-xs text-slate-500 line-clamp-2 pr-2">
            {project.projectDescription || 'No description provided.'}
          </p>
        }
        onRename={() => setIsRenameOpen(true)}
        onDelete={handleDelete}
        deleteDescription={`This action cannot be undone. This will permanently delete the "${project.projectName}" project and all its boards and tasks.`}
      />
      <RenameProjectModal
        project={project}
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        onSuccess={(updated) => { onRename(updated); setIsRenameOpen(false); }}
      />
    </>
  );
}

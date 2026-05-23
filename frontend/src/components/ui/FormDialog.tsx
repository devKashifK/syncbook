'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Loader2 } from 'lucide-react';

export type FormField = {
  id: string;
  label: string;
  placeholder?: string;
  type?: 'input' | 'textarea';
  required?: boolean;
};

type FormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: FormField[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  submitLabel: string;
  isLoading?: boolean;
  error?: string | null;
  disabled?: boolean;
};

export default function FormDialog({
  isOpen,
  onClose,
  title,
  description,
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel,
  isLoading = false,
  error,
  disabled = false,
}: FormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          {fields.map((field, i) => (
            <div key={field.id} className="space-y-2">
              <label htmlFor={field.id} className="text-sm font-medium leading-none">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.id}
                  value={values[field.id] ?? ''}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={isLoading}
                  rows={3}
                />
              ) : (
                <Input
                  id={field.id}
                  value={values[field.id] ?? ''}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={isLoading}
                  autoFocus={i === 0}
                  required={field.required}
                />
              )}
            </div>
          ))}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || disabled} className="bg-blue-600 hover:bg-blue-700">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

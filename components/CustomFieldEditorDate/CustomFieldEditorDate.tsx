import React, { JSX } from 'react';
import { CustomField } from '../../types/customField';

interface CustomFieldEditorDateProps {
  value: string;
  field: CustomField;
  onChange: (field: CustomField, value: string) => void;
}

export function CustomFieldEditorDate({
  value,
  field,
  onChange,
}: CustomFieldEditorDateProps): JSX.Element {
  return (
    <input
      type="date"
      value={value ? new Date(value).toISOString().split('T')[0] : ''}
      onChange={(e) => onChange(field, e.target.value)}
      className="w-full px-4 py-2 rounded-lg
                     bg-background-primary 
                     text-text-primary
                     border border-background-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary
                     placeholder-text-secondary/50
                     transition-all duration-text"
    />
  );
}

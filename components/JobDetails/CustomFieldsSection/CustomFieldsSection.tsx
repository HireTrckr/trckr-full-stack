import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomFieldStore } from '../../../context/customFieldStore';
import {
  CustomField,
  CustomFieldType,
  CustomFieldValue,
} from '../../../types/customField';
import { Job, JobNotSavedInDB } from '../../../types/job';

interface CustomFieldsSectionProps {
  job: JobNotSavedInDB;
  onValid: () => void;
  onInvalid: () => void;
  onChange: (value: CustomFieldValue) => void;
}

export function CustomFieldsSection({
  job,
  onValid,
  onInvalid,
  onChange,
}: CustomFieldsSectionProps) {
  const fields = useCustomFieldStore((state) => state.fieldMap);
  const jobFieldValues = job.customFields || {};

  if (Object.keys(fields).length === 0) {
    return null;
  }

  function handleChange(
    field: CustomField,
    value: string | number | boolean | Date | null
  ) {
    onChange({ fieldId: field.id, value });
    if (field.required && (value === null || value === '')) {
      onInvalid();
    } else {
      onValid();
    }
  }

  const renderFieldValue = (field: CustomField) => {
    // if the job has a value for this field then use it, otherwise use the default value, else use null
    const fieldValue = jobFieldValues[field.id]?.value ?? field.defaultValue;

    switch (field.type) {
      case CustomFieldType.STRING:
        return (
          <input
            type="text"
            value={(fieldValue as string) || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={field.name}
            className="w-full px-4 py-2 rounded-lg
                     bg-background-primary 
                     text-text-primary
                     border border-background-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary
                     placeholder-text-secondary/50
                     transition-all duration-text"
          />
        );
      case CustomFieldType.NUMBER:
        return (
          <input
            type="number"
            value={fieldValue as number}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={field.name}
            className="w-full px-4 py-2 rounded-lg
                     bg-background-primary 
                     text-text-primary
                     border border-background-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary
                     placeholder-text-secondary/50
                     transition-all duration-text"
          />
        );
      case CustomFieldType.BOOLEAN:
        return (
          <input
            type="checkbox"
            checked={!!fieldValue}
            onChange={(e) => handleChange(field, e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        );
      case CustomFieldType.DATE:
        return (
          <input
            type="date"
            value={
              fieldValue
                ? new Date(fieldValue as string).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full px-4 py-2 rounded-lg
                     bg-background-primary 
                     text-text-primary
                     border border-background-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary
                     placeholder-text-secondary/50
                     transition-all duration-text"
          />
        );
      case CustomFieldType.SELECT:
        return (
          <select
            value={(fieldValue as string) || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 w-full"
          >
            {field.options?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="my-4 w-full max-h-[2rem]">
      {Object.values(fields).map((field) => (
        <div key={field.id} className="w-full flex flex-col pb-4">
          <label className="text-text-primary block text-xs">
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderFieldValue(field)}
        </div>
      ))}
    </div>
  );
}

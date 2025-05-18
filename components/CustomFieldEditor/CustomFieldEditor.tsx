import React, { JSX } from 'react';
import { CustomField, CustomFieldType } from '../../types/customField';
import { JobNotSavedInDB } from '../../types/job';
import { CustomFieldEditorString } from '../CustomFieldEditorString/CustomFieldEditorString';
import { CustomFieldEditorNumber } from '../CustomFieldEditorNumber/CustomFieldEditorNumber';
import { CustomFieldEditorBoolean } from '../CustomFieldEditorBoolean/CustomFieldEditorBoolean';
import { CustomFieldEditorDate } from '../CustomFieldEditorDate/CustomFieldEditorDate';
import { CustomFieldEditorSelect } from '../CustomFieldEditorSelect/CustomFieldEditorSelect';

interface CustomFieldEditorProps {
  job: JobNotSavedInDB;
  field: CustomField;
  onChange: (
    field: CustomField,
    value: string | number | boolean | Date | null
  ) => void;
}

export function CustomFieldEditor({
  job,
  field,
  onChange,
}: CustomFieldEditorProps): JSX.Element {
  const renderFieldValue = (field: CustomField) => {
    // if the job has a value for this field then use it, otherwise use the default value, else use null
    const fieldValue =
      (job.customFields || {})[field.id]?.value ?? field.defaultValue ?? null;

    switch (field.type) {
      case CustomFieldType.STRING:
        return (
          <CustomFieldEditorString
            value={fieldValue as string}
            field={field}
            onChange={onChange}
          />
        );
      case CustomFieldType.NUMBER:
        return (
          <CustomFieldEditorNumber
            value={fieldValue as number}
            field={field}
            onChange={onChange}
          />
        );
      case CustomFieldType.BOOLEAN:
        return (
          <CustomFieldEditorBoolean
            value={fieldValue as boolean}
            field={field}
            onChange={onChange}
          />
        );
      case CustomFieldType.DATE:
        return (
          <CustomFieldEditorDate
            value={fieldValue as string}
            field={field}
            onChange={onChange}
          />
        );
      case CustomFieldType.SELECT:
        return (
          <CustomFieldEditorSelect
            value={fieldValue as string}
            field={field}
            onChange={onChange}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div key={field.id} className="w-full flex flex-col pb-4 relative">
      <label className="text-text-primary block text-xs">
        {field.name}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderFieldValue(field)}
    </div>
  );
}

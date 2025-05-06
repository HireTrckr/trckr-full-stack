import { timestamps } from './timestamps';

export enum CustomFieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  SELECT = 'select',
}

export interface CustomFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface CustomField {
  id: string;
  name: string;
  type: CustomFieldType;
  options?: CustomFieldOption[] | null; // For SELECT type fields
  timestamps: timestamps;
  required: boolean;
  defaultValue: string | number | boolean | Date | null;
}

export type CustomFieldNotSavedInDB = Omit<CustomField, 'id' | 'timestamps'>;

export interface CustomFieldValue {
  fieldId: string;
  value: string | number | boolean | Date | null;
}

export interface JobCustomFields {
  [fieldId: string]: CustomFieldValue;
}

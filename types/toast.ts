export interface MetaToast {
  title?: string;
  titleKey?: string;
  titleParams?: Record<string, any>;
  type?: ToastCategory;
  duration?: number;
  onClick?: () => void;
  undo?: (toast: Toast) => void;
}

export interface Toast extends MetaToast {
  message: string;
  messageKey: string;
  messageParams?: Record<string, any>;
  _id?: string;
  _createdAt?: number;
}

export enum ToastCategory {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
}

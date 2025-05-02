export type Toast = {
  message: string;
  messageKey?: string;
  messageParams?: Record<string, any>;
  _id: string;
  _createdAt: number;
} & Partial<MetaToast>;

export type MetaToast = {
  title: string;
  titleKey: string;
  titleParams: Record<string, any>;
  type: ToastCategory;
  duration: number;
  onClick: () => void;
  undo: (toast: Toast) => void;
};

export enum ToastCategory {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

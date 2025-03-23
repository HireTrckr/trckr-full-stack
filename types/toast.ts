export type confirmedToast = {
  message: string;
} & MetaToast;

export type Toast = {
  message: string;
  _id: string;
  _createdAt: number;
} & Partial<MetaToast>;

export type MetaToast = {
  title: string;
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

export type confirmedToast = {
  message: string;
} & MetaToast;

export type Toast = {
  message: string;
} & Partial<MetaToast>;

export type MetaToast = {
  title: string;
  type: ToastType;
  duration: number;
  onClick: () => void;
};

const toastTypes = ['success', 'error', 'warning', 'info'];

export type ToastType = (typeof toastTypes)[number];

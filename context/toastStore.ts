import { create } from 'zustand';
import { Toast, ToastCategory, MetaToast } from '../types/toast';

const generateToastId = (
  severity: ToastCategory = ToastCategory.INFO
): string => {
  return `toast-${Date.now()}-${severity}-${Math.random().toString(36).substring(2, 9)}`;
};

class ToastQueue {
  private items: Toast[];

  constructor() {
    this.items = [];
  }

  enqueue(item: Toast): void {
    this.items.push(item);
  }

  dequeue(): Toast | undefined {
    return this.items.shift();
  }

  peek(): Toast | undefined {
    return this.items[0];
  }

  get length(): number {
    return this.items.length;
  }

  get all(): Toast[] {
    return this.items;
  }
}

type toastStore = {
  toastQueue: ToastQueue;
  currentToast: Toast | null;
  addToast: (toast: Toast) => boolean;
  createToast: (
    msg: string,
    addToStore: boolean,
    title?: string,
    type?: ToastCategory,
    duration?: number,
    onClick?: () => void,
    undo?: (toast: Toast) => void
  ) => Toast;
  getNextToast: () => Toast | undefined;
  checkAndDisplayToast: () => void;
  removeCurrentToast: () => void;
};

const defaultToast: MetaToast = {
  title: '',
  type: ToastCategory.INFO,
  duration: 5000,
  onClick: () => {},
  undo: (toast) => {},
};

export const useToastStore = create<toastStore>((set, get) => ({
  toastQueue: new ToastQueue(),
  currentToast: null,
  addToast: (toast: Toast) => {
    const newToast: Toast = { ...defaultToast, ...toast };

    try {
      set((state) => {
        state.toastQueue.enqueue(newToast);
        return { toastQueue: state.toastQueue };
      });

      get().checkAndDisplayToast();
      return true;
    } catch (e) {
      return false;
    }
  },

  removeCurrentToast: () => {
    set({ currentToast: null });
    // Check for next toast after removing current
    get().checkAndDisplayToast();
  },

  checkAndDisplayToast: () => {
    const state = get();

    // If there's no current toast and queue has items, display next toast
    if (!state.currentToast && state.toastQueue.length > 0) {
      const nextToast = state.toastQueue.dequeue();
      if (nextToast) {
        set({ currentToast: nextToast });
      }
    }
  },

  createToast(
    msg,
    addToStore = false,
    title = defaultToast.title,
    type = ToastCategory.INFO,
    duration = defaultToast.duration,
    onClick,
    undo
  ) {
    const newToast: Toast = {
      message: msg,
      title,
      type,
      duration,
      onClick,
      undo,
      _id: generateToastId(type),
      _createdAt: Date.now(),
    };

    if (addToStore) {
      get().addToast(newToast);
    }

    return newToast;
  },

  getNextToast() {
    const toast = this.toastQueue.dequeue();
    set((state) => ({ toastQueue: state.toastQueue }));
    return toast;
  },
}));

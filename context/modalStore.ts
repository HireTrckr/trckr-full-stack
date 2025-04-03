import { create } from 'zustand';
import { EditTagModalProps } from '../components/EditTagModal/EditTagModal';

type ModalStore = {
  isOpen: boolean;
  modalType: string | null;
  modalProps: Record<string, any>;
  openTagCreatorModal: () => void;
  openTagEditorModal: (props: EditTagModalProps) => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  modalType: null,
  modalProps: {},
  openTagCreatorModal: () => {
    set({ isOpen: true, modalType: 'tagCreator' });
  },
  openTagEditorModal: (props: EditTagModalProps) => {
    set({ isOpen: true, modalType: 'tagEditor', modalProps: props });
  },
  closeModal: () => {
    set({ isOpen: false });
  },
}));

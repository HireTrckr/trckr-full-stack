import { create } from 'zustand';
import { EditTagModalProps } from '../components/Modals/EditTagModal/EditTagModal';
import { EditJobModalProps } from '../components/Modals/EditJobModal/EditJobModal';
import { CreateTagModalProps } from '../components/Modals/CreateTagModal/CreateTagModal';
import { ModalTypes } from '../types/modalTypes';
import { CreateStatusModalProps } from '../components/Modals/CreateStatusModal/CreateStatusModal';
import { EditStatusModalProps } from '../components/Modals/EditStatusModal/EditStatusModal';
import { CustomFieldCreatorModalProps } from '../components/Modals/CustomFieldCreatorModal/CustomFieldCreatorModal';
import { CustomFieldEditorModalProps } from '../components/Modals/CustomFieldEditorModal/CustomFieldEditorModal';

export type ModalProps = {
  type: string;
  props:
    | EditJobModalProps
    | CreateTagModalProps
    | EditTagModalProps
    | EditTagModalProps
    | CreateStatusModalProps
    | EditStatusModalProps
    | CustomFieldCreatorModalProps
    | CustomFieldEditorModalProps;
};

type ModalStore = {
  isOpen: boolean;
  modalType: string | null;
  modalProps: Record<string, any>;
  openTagCreatorModal: (props: ModalProps) => void;
  openTagEditorModal: (props: ModalProps) => void;
  openJobEditorModal: (props: ModalProps) => void;
  openStatusCreatorModal: (props: ModalProps) => void;
  openStatusEditorModal: (props: ModalProps) => void;
  openCustomFieldCreatorModal: (props: ModalProps) => void;
  openCustomFieldEditorModal: (props: ModalProps) => void;

  /**
   * Closes the currently open modal - regardless of type.
   * @returns {void}
   */
  closeModal: () => void;
};

export const useModalStore = create<ModalStore>((set, get) => ({
  isOpen: false,
  modalType: null,
  modalProps: {},
  openTagCreatorModal: (props: ModalProps) => {
    if (props.type === ModalTypes.tagCreator) {
      set({
        isOpen: true,
        modalType: ModalTypes.tagCreator,
        modalProps: props.props,
      });
    } else {
      console.warn(
        'Modal type mismatch: expected tagCreator, but got',
        get().modalProps['type']
      );
      get().closeModal();
    }
  },
  openStatusCreatorModal: (props: ModalProps) => {
    if (props.type === ModalTypes.statusCreator) {
      set({
        isOpen: true,
        modalType: ModalTypes.statusCreator,
        modalProps: props.props,
      });
    } else {
      console.warn(
        'Modal type mismatch: expected statusCreator, but got',
        get().modalProps['type']
      );
      get().closeModal();
    }
  },
  openTagEditorModal: (props: ModalProps) => {
    if (props.type === ModalTypes.tagEditor) {
      set({
        isOpen: true,
        modalType: ModalTypes.tagEditor,
        modalProps: props.props,
      });
    } else {
      console.warn(
        'Modal type mismatch: expected tagEditor, but got',
        get().modalProps['type']
      );
      get().closeModal();
    }
  },
  openStatusEditorModal: (props: ModalProps) => {
    if (props.type === ModalTypes.statusEditor) {
      set({
        isOpen: true,
        modalType: ModalTypes.statusEditor,
        modalProps: props.props,
      });
    } else {
      console.warn(
        'Modal type mismatch: expected statusEditor, but got',
        get().modalProps['type']
      );
      get().closeModal();
    }
  },
  openJobEditorModal: (props: ModalProps) => {
    if (props.type === ModalTypes.jobEditor) {
      set({
        isOpen: true,
        modalType: ModalTypes.jobEditor,
        modalProps: props.props,
      });
    } else {
      console.warn(
        'Modal type mismatch: expected jobEditor, but got',
        get().modalProps['type']
      );
      get().closeModal();
    }
  },
  openCustomFieldCreatorModal: (props: ModalProps) => {
    if (props.type === ModalTypes.customFieldCreator) {
      set({
        isOpen: true,
        modalType: ModalTypes.customFieldCreator,
        modalProps: props.props,
      });
    } else {
      console.warn(
        'Modal type mismatch: expected customFieldCreator, but got',
        get().modalProps['type']
      );
      get().closeModal();
    }
  },
  openCustomFieldEditorModal: (props: ModalProps) => {
    if (props.type === ModalTypes.customFieldEditor) {
      set({
        isOpen: true,
        modalType: ModalTypes.customFieldEditor,
        modalProps: props.props,
      });
    } else {
      console.warn(
        'Modal type mismatch: expected customFieldEditor, but got',
        get().modalProps['type']
      );
      get().closeModal();
    }
  },
  closeModal: () => {
    set({ isOpen: false, modalType: null, modalProps: {} });
  },
}));

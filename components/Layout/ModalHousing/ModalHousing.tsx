import { useEffect, useRef } from 'react';
import { CreateTagModal } from '../../Modals/CreateTagModal/CreateTagModal';
import { useModalStore } from '../../../context/modalStore';
import { EditTagModal } from '../../Modals/EditTagModal/EditTagModal';
import { EditJobModal } from '../../Modals/EditJobModal/EditJobModal';
import { ModalTypes } from '../../../types/modalTypes';
import { CreateStatusModal } from '../../Modals/CreateStatusModal/CreateStatusModal';
import { EditStatusModal } from '../../Modals/EditStatusModal/EditStatusModal';

interface ModalHousingProps {
  children: React.ReactNode;
}

export function ModalHousing({ children }: ModalHousingProps) {
  const isOpen = useModalStore((state) => state.isOpen);
  const modalType = useModalStore((state) => state.modalType);
  const modalProps = useModalStore((state) => state.modalProps);
  const closeModal = useModalStore((state) => state.closeModal);

  const modalRef = useRef<HTMLDivElement>(null);

  // not type-safe but 🥶
  const getModalContent = () => {
    switch (modalType) {
      case ModalTypes.tagCreator:
        return (
          <CreateTagModal
            onCancel={modalProps.onCancel}
            onSave={modalProps.onSave}
          />
        );
      case ModalTypes.tagEditor:
        return (
          <EditTagModal
            tag={modalProps.tag}
            onSave={modalProps.onSave}
            onClose={modalProps.onClose}
            onDelete={modalProps.onDelete}
          />
        );
      case ModalTypes.jobEditor:
        return (
          <EditJobModal
            job={modalProps.job}
            onClose={modalProps.onClose}
            onDelete={modalProps.onDelete}
            onSave={modalProps.onSave}
          />
        );
      case ModalTypes.statusCreator:
        return (
          <CreateStatusModal
            onCancel={modalProps.onCancel}
            onSave={modalProps.onSave}
          />
        );
      case ModalTypes.statusEditor:
        return (
          <EditStatusModal
            status={modalProps.status}
            onClose={modalProps.onClose}
            onDelete={modalProps.onDelete}
            onSave={modalProps.onSave}
          />
        );
    }
  };

  useEffect(() => {
    if (
      modalType &&
      ![
        ModalTypes.tagCreator,
        ModalTypes.tagEditor,
        ModalTypes.jobEditor,
        ModalTypes.statusCreator,
        ModalTypes.statusEditor,
      ].includes(modalType as ModalTypes)
    ) {
      closeModal();
    }
  }, [modalType]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm z-50"
          id="modal--blur-overlay"
        >
          <div
            ref={modalRef}
            className="bg-background-secondary rounded-lg transition-all duration-bg ease-in-out p-6 shadow-light"
            id="modal-housing--onclick-listener"
          >
            {getModalContent()}
          </div>
        </div>
      )}
    </>
  );
}

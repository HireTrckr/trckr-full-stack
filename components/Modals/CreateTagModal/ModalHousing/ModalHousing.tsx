import { useEffect, useRef } from 'react';
import { CreateTagModal } from '../CreateTagModal';
import { useModalStore } from '../../../../context/modalStore';
import {
  EditTagModal,
  EditTagModalProps,
} from '../../../EditTagModal/EditTagModal';
import { EditJobModal } from '../../../EditJobModal/EditJobModal';

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
  const getModal = () => {
    switch (modalType) {
      case 'tagCreator':
        return <CreateTagModal />;
      case 'tagEditor':
        return (
          <EditTagModal
            tag={modalProps.tag}
            onSave={modalProps.onSave}
            onClose={modalProps.onClose}
            onDelete={modalProps.onDelete}
          />
        );
      case 'editJob':
        return (
          <EditJobModal
            job={modalProps.job}
            onClose={modalProps.onClose}
            onDelete={modalProps.onDelete}
            onSave={modalProps.onSave}
          />
        );
      default:
        closeModal();
        return null;
    }
  };

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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm z-50">
          <div
            ref={modalRef}
            className="w-full flex items-center justify-center"
          >
            {getModal()}
          </div>
        </div>
      )}
    </>
  );
}

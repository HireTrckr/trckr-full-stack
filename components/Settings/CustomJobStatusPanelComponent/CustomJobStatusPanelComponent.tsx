import React, { JSX } from 'react';
import { useStatusStore } from '../../../context/statusStore';
import { JobStatus, JobStatusNotSavedInDB } from '../../../types/jobStatus';
import { ModalProps, useModalStore } from '../../../context/modalStore';
import { ModalTypes } from '../../../types/modalTypes';
import { useToastStore } from '../../../context/toastStore';
import { SkeletonCustomJobStatusPanelComponent } from './SkeletonCustomJobStatusPanelComponent/SkeletonCustomJobStatusPanelComponent';
import { ButtonsComponent } from '../../ButtonsComponent/ButtonsComponent';
import { useTranslation } from 'react-i18next';

export function CustomJobStatusPanelComponent(): JSX.Element {
  const resetStatus = useStatusStore((state) => state.resetStatuses);
  const statuses = useStatusStore((state) => state.statusMap);
  const createStatus = useStatusStore((state) => state.createStatus);
  const isLoading = useStatusStore((state) => state.isLoading);

  const { t } = useTranslation();

  const openStatusCreator = useModalStore(
    (state) => state.openStatusCreatorModal
  );
  const openStatusEditor = useModalStore(
    (state) => state.openStatusEditorModal
  );
  const closeModal = useModalStore((state) => state.closeModal);

  const { createTranslatedToast } = useToastStore();

  const handleReset = () => {
    // remove all custom status
    resetStatus();
  };

  const handleStatusCreate = () => {
    openStatusCreateModal();
  };

  const getStatusCreatorProps = (): ModalProps => {
    return {
      props: {
        onCancel: () => {
          closeModal();
        },

        onSave: async (status: Partial<JobStatusNotSavedInDB>) => {
          createStatus(status);
          closeModal();
        },
      },
      type: ModalTypes.statusCreator,
    };
  };

  const openStatusCreateModal = () => {
    openStatusCreator(getStatusCreatorProps());
  };

  const getStatusEditorProps = (status: JobStatus) => {
    return {
      props: {
        status,
        onSave: async (updatedStatus: JobStatus) => {
          // Handle saving the updated status
          await useStatusStore.getState().updateStatus(updatedStatus);
          closeModal();
        },
        onDelete: async (status: JobStatus) => {
          // Handle deleting the status
          await useStatusStore.getState().deleteStatus(status.id);
          closeModal();
        },
        onClose: () => {
          // Handle closing the modal
          closeModal();
        },
      },
      type: ModalTypes.statusEditor,
    };
  };

  const openStatusEditorModal = (status: JobStatus) => {
    if (!status.deletable) return;
    openStatusEditor(getStatusEditorProps(status));
  };

  if (isLoading) return <SkeletonCustomJobStatusPanelComponent />;

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <span className="text-xs text-text-secondary">
          {t('settings.status.title')}
        </span>
        <button
          className="hover:bg-background-secondary rounded-full aspect-square h-[2rem]"
          onClick={() => handleStatusCreate()}
        >
          +
        </button>
      </div>

      <div className="grid grid-cols-4 grid-flow-row auto-rows-[25%] min-w-full overflow-y-scroll flex-1 gap-2">
        {statuses &&
          Object.values(statuses).map((option: JobStatus) => (
            <div
              key={option.id}
              className={`flex justify-evenly items-center gap-2 w-full p-2 ${option.deletable ? 'hover:bg-background-secondary cursor-pointer' : 'cursor-not-allowed'} min-w-full max-w-full border-2 border-${option.color}-500 rounded-lg transition-all duration-bg`}
              onClick={() => openStatusEditorModal(option)}
            >
              <div
                className={`rounded-full aspect-square h-[1rem] bg-${option.color}-300`}
              />
              <div className="flex-1 overflow-x-auto">
                <span className="text-text-primary max-h-full">
                  {option.deletable ? option.statusName : t(option.statusName)}
                </span>
              </div>
            </div>
          ))}
      </div>
      <div className="flex items-center justify-center w-full text-xs">
        {/* TODO: Add popup for confirming*/}
        <ButtonsComponent onReset={handleReset} />
      </div>
    </>
  );
}

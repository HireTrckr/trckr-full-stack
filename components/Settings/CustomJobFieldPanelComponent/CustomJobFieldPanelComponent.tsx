import React, { JSX } from 'react';
import { ButtonsComponent } from '../../ButtonsComponent/ButtonsComponent';
import { useTranslation } from 'react-i18next';
import { NoDataComponent } from '../../NoDataComponent/NoDataComponent';
import { FiList } from 'react-icons/fi';
import { useCustomFieldStore } from '../../../context/customFieldStore';
import {
  CustomField,
  CustomFieldNotSavedInDB,
} from '../../../types/customField';
import { ModalProps, useModalStore } from '../../../context/modalStore';
import { ModalTypes } from '../../../types/modalTypes';

export function CustomJobFieldPanelComponent(): JSX.Element {
  const { t } = useTranslation();

  const fields = useCustomFieldStore((state) => state.fieldMap);
  const deleteField = useCustomFieldStore((state) => state.deleteField);
  const deleteAllFields = useCustomFieldStore((state) => state.deleteAllFields);

  const openCustomFieldCreatorModal = useModalStore(
    (state) => state.openCustomFieldCreatorModal
  );
  const openCustomFieldEditorModal = useModalStore(
    (state) => state.openCustomFieldEditorModal
  );
  const closeModal = useModalStore((state) => state.closeModal);

  const handleReset = () => {
    // delete all custom fields
    deleteAllFields();
  };

  function handleFieldCreate() {
    openCustomFieldCreatorModal(getFieldCreatorProps());
  }

  const getFieldCreatorProps = (): ModalProps => {
    return {
      props: {
        onCancel: () => {
          closeModal();
        },
        onSave: async (newField: CustomFieldNotSavedInDB) => {
          await useCustomFieldStore.getState().createField(newField);
          closeModal();
        },
      },
      type: ModalTypes.customFieldCreator,
    };
  };

  const getFieldEditorProps = (field: CustomField): ModalProps => {
    return {
      props: {
        field,
        onSave: async (updatedField: CustomField) => {
          await useCustomFieldStore.getState().updateField(updatedField);
          closeModal();
        },
        onDelete: async (field: CustomField) => {
          await deleteField(field.id);
          closeModal();
        },
        onClose: () => {
          closeModal();
        },
      },
      type: ModalTypes.customFieldEditor,
    };
  };

  const openFieldEditorModal = (field: CustomField) => {
    openCustomFieldEditorModal(getFieldEditorProps(field));
  };

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <span className="text-xs text-text-secondary">
          {t('settings.fields.title')}
        </span>
        <button
          className="hover:bg-background-secondary rounded-full aspect-square h-[2rem]"
          onClick={handleFieldCreate}
        >
          +
        </button>
      </div>
      {Object.values(fields).length === 0 && (
        <NoDataComponent
          icon={FiList}
          title={t('settings.fields.no-fields-title')}
          message={t('settings.fields.no-fields-msg')}
          action={{
            label: t('modals.customField.create.title'),
            onClick: handleFieldCreate,
          }}
        />
      )}
      {Object.values(fields).length !== 0 && (
        <>
          <div className="grid grid-rows-4 grid-flow-col auto-cols-[30%] gap-2 min-w-full overflow-x-scroll">
            {Object.values(fields).map((field: CustomField) => (
              <button
                key={field.id}
                className="flex justify-between items-center gap-2 w-full p-2 hover:bg-background-secondary cursor-pointer min-w-full max-w-full border-2 border-gray-500 rounded-lg transition-all duration-bg"
                onClick={() => openFieldEditorModal(field)}
              >
                <span className="text-text-primary">{field.name}</span>
                <span className="text-text-secondary text-xs uppercase">
                  {field.type}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center w-full text-xs mt-4">
            <ButtonsComponent onReset={handleReset} />
          </div>
        </>
      )}
    </>
  );
}

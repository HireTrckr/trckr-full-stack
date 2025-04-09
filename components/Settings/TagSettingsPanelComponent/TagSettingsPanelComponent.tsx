import React, { JSX } from 'react';
import { useTagStore } from '../../../context/tagStore';
import { ModalProps, useModalStore } from '../../../context/modalStore';
import { Tag, TagNotSavedInDB } from '../../../types/tag';
import { Job } from '../../../types/job';
import { ModalTypes } from '../../../types/modalTypes';

interface TagSettingsPanelComponentProps {}

export function TagSettingsPanelComponent({}: TagSettingsPanelComponentProps): JSX.Element {
  const openTagCreatorModal = useModalStore(
    (state) => state.openTagCreatorModal
  );
  const openTagEditor = useModalStore((state) => state.openTagEditorModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const tags = useTagStore((state) => state.tagMap);
  const createTag = useTagStore((state) => state.createTag);
  const addTagsToJob = useTagStore((state) => state.addTagToJob);
  const isLoading = useTagStore((state) => state.isLoading);

  const getTagCreatorProps = (): ModalProps => {
    return {
      props: {
        onCancel: () => {
          // Handle cancel action
          closeModal();
        },
        onSave: async (
          newTag: Partial<TagNotSavedInDB>,
          tagJobs: Job['id'][]
        ) => {
          const id = await createTag(newTag);
          if (!id) {
            console.error('Failed to create tag');
            return;
          }
          // add tags to each job
          tagJobs.forEach((jobId: Job['id']) => {
            console.log('adding tag to job', jobId);
            addTagsToJob(jobId, id);
          });

          closeModal();
        },
      },
      type: ModalTypes.tagCreator,
    };
  };

  const openCreateTagModal = () => {
    // Open modal to create a new tag
    openTagCreatorModal(getTagCreatorProps());
  };

  const getTagEditorProps = (tag: Tag): ModalProps => {
    return {
      props: {
        tag,
        onSave: async (updatedTag: Tag) => {
          // Handle saving the updated tag
          await useTagStore.getState().updateTag(updatedTag);
          closeModal();
        },
        onDelete: async (tag: Tag) => {
          // Handle deleting the tag
          await useTagStore.getState().deleteTag(tag.id);
          closeModal();
        },
        onClose: () => {
          // Handle closing the modal
          closeModal();
        },
      },
      type: ModalTypes.tagEditor,
    };
  };

  const openTagEditorModal = (tag: Tag) => {
    // Open modal to edit a tag
    openTagEditor(getTagEditorProps(tag));
  };

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <span className="text-xs text-text-secondary">Tags</span>
        <button
          className="hover:bg-background-secondary rounded-full aspect-square h-[2rem]"
          onClick={() => openCreateTagModal()}
        >
          +
        </button>
      </div>
      <div className="grid grid-rows-4 grid-flow-col auto-cols-[30%] gap-2 min-w-full overflow-x-scroll">
        {tags &&
          Object.values(tags).map((tag: Tag) => (
            <button
              key={tag.id}
              className={`flex justify-between items-center gap-2 w-full p-2 hover:bg-background-secondary cursor-pointer min-w-full max-w-full border-2 border-${tag.color}-500 rounded-lg transition-all duration-bg`}
              onClick={() => openTagEditorModal(tag)}
            >
              <span className="text-text-primary">{tag.name}</span>

              <span className="text-text-secondary">
                {tag.count} job{tag.count !== 1 && 's'}
              </span>
            </button>
          ))}
      </div>
    </>
  );
}

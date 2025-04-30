import { useEffect, useState, useCallback, useRef } from 'react';
import { SearchableItem, SearchResult } from '../../../types/SearchBarItemType';
import { SearchBarItem } from './SearchBarItem/SearchBarItem';
import { useJobStore } from '../../../context/jobStore';
import { useTagStore } from '../../../context/tagStore';
import { Job } from '../../../types/job';
import { Tag, TagMap } from '../../../types/tag';
import { useTranslation } from 'react-i18next';
import { ModalProps, useModalStore } from '../../../context/modalStore';
import { ModalTypes } from '../../../types/modalTypes';

interface SearchBarProps {}

export function SearchBar({}: SearchBarProps) {
  const jobs = useJobStore((state) => state.jobs);
  const updateJob = useJobStore((state) => state.updateJob);
  const deleteJob = useJobStore((state) => state.deleteJob);
  const tags: TagMap = useTagStore((state) => state.tagMap);
  const updateTag = useTagStore((state) => state.updateTag);
  const deleteTag = useTagStore((state) => state.deleteTag);

  const openJobEditor = useModalStore((state) => state.openJobEditorModal);
  const openTagEditor = useModalStore((state) => state.openTagEditorModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>('');

  const searchBarRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

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

  const getJobEditorProps = (job: Job): ModalProps => {
    return {
      props: {
        job,
        onSave: handleJobUpdate,
        onDelete: handleJobDelete,
        onClose: handleModalClose,
      },
      type: ModalTypes.jobEditor,
    };
  };

  const openJobEditorModal = (job: Job) => {
    // Open modal to edit a job
    openJobEditor(getJobEditorProps(job));
  };

  const getSearchMatches = useCallback(
    (term: string) => {
      if (!term || term === '') {
        setSearchResults([]);
        return;
      }

      const lCaseTerm: string = term.toLowerCase();
      const results: SearchableItem[] = [];
      const seenIds = new Set<string>();

      jobs.forEach((job: Job) => {
        if (
          job.company.toLowerCase().includes(lCaseTerm) ||
          job.position.toLowerCase().includes(lCaseTerm) ||
          (job.tagIds?.some((tagId) =>
            tags[tagId]?.name.toLowerCase().includes(lCaseTerm)
          ) &&
            !seenIds.has(job.id))
        ) {
          results.push({ type: 'job', item: job });
          seenIds.add(job.id);
        }
      });

      Object.entries(tags).forEach(([tagId, tag]: [string, Tag]) => {
        if (tag.name.toLowerCase().includes(lCaseTerm) && !seenIds.has(tagId)) {
          results.push({ type: 'tag', item: tag });
          seenIds.add(tagId);
        }
      });

      setSearchResults(
        results.map((result: SearchableItem) => {
          return {
            ...result,
            id: result.item.id,
          };
        })
      );
    },
    [jobs, tags]
  );

  function handleModalClose(): void {
    setSelectedResult(null);
    clearSearchBar();
    closeModal();
  }

  async function handleJobUpdate(updatedJob: Job) {
    if (!updatedJob) return;

    // ensure job actually changed
    if (
      selectedResult &&
      updatedJob &&
      JSON.stringify(selectedResult) === JSON.stringify(updatedJob)
    ) {
      return;
    }

    await updateJob(updatedJob);
    handleModalClose();
  }

  async function handleJobDelete(deletedJob: Job) {
    if (!deletedJob) return;

    await deleteJob(deletedJob);
    handleModalClose();
  }

  function handleSuggestionSelection(suggestion: SearchResult) {
    if (suggestion.type === 'job') {
      openJobEditorModal(suggestion.item as Job);
    } else if (suggestion.type === 'tag') {
      openTagEditorModal(suggestion.item as Tag);
    }
  }

  function clearSearchBar() {
    setSearchTerm('');
  }

  // if user clicks away from search bar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        clearSearchBar();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchBarRef]);

  useEffect(() => {
    getSearchMatches(searchTerm);
  }, [searchTerm]);

  return (
    <div
      className="transition-colors duration-text text-text-primary w-md px-2 flex-1"
      ref={searchBarRef}
    >
      <input
        type="text"
        placeholder={t('navbar.searchbar.placeholder')}
        value={searchTerm}
        className="w-full px-2 rounded-lg
                     bg-background-primary 
                     text-text-primary
                     border border-background-secondary
                     focus:outline-none focus:ring-1 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary
                     placeholder-text-secondary/50
                     transition-colors duration-text ease-in-out"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="absolute bg-background-primary rounded-lg shadow-lg mt-2 max-w-full">
        {searchResults.map((sbItem: SearchResult) => (
          <div
            key={sbItem.item.id}
            className="p-2 hover:bg-background-secondary cursor-pointer min-w-full max-w-full"
            onClick={() => handleSuggestionSelection(sbItem)}
          >
            <SearchBarItem item={sbItem} />
          </div>
        ))}
      </div>
    </div>
  );
}

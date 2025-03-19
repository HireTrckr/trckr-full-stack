import { useEffect, useState, useCallback } from 'react';
import { SearchableItem, SearchResult } from '../../types/SearchBarItemType';
import { SearchBarItem } from '../SearchBarItem/SearchBarItem';
import { useJobStore } from '../../context/jobStore';
import { useTagStore } from '../../context/tagStore';

import { createPortal } from 'react-dom';
import { EditJobModal } from '../EditJobModal/EditJobModal';

import { Job } from '../../types/job';
import { Tag, TagMap } from '../../types/tag';
import { EditTagModal } from '../EditTagModal/EditTagModal';

interface SearchBarProps {}

export function SearchBar() {
  const jobs = useJobStore((state) => state.jobs);
  const updateJob = useJobStore((state) => state.updateJob);
  const deleteJob = useJobStore((state) => state.deleteJob);
  const tags: TagMap = useTagStore((state) => state.tagMap);
  const updateTag = useTagStore((state) => state.updateTag);
  const deleteTag = useTagStore((state) => state.deleteTag);

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>('');

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
    console.log('handling close');
    setSelectedResult(null);
    setIsModalOpen(false);
  }

  async function handleTagUpdate(updatedTag: Tag) {
    if (!updatedTag) return;

    if (
      selectedResult &&
      updatedTag &&
      JSON.stringify(selectedResult) === JSON.stringify(updatedTag)
    ) {
      return;
    }

    console.log(await updateTag(updatedTag));
    handleModalClose();
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

  async function handleTagDelete(deletedTag: Tag) {
    if (!deletedTag) return;

    await deleteTag(deletedTag.id);
    handleModalClose();
  }

  async function handleJobDelete(deletedJob: Job) {
    console.log('handling delete');
    if (!deletedJob) return;

    await deleteJob(deletedJob);
    handleModalClose();
  }

  function handleSuggestionSelection(suggestion: SearchResult) {
    setSelectedResult(suggestion);
    setIsModalOpen(true);
  }

  useEffect(() => {
    getSearchMatches(searchTerm);
  }, [searchTerm]);

  return (
    <div className="transition-colors duration-text text-text-primary w-md px-8 flex-1">
      <input
        type="text"
        placeholder="Search your applications and tags..."
        value={searchTerm}
        className="w-full px-2 rounded-lg
                     bg-background-primary 
                     text-text-primary
                     border border-background-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 focus:bg-background-secondary
                     placeholder-text-secondary/50
                     transition-all duration-text"
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

      {isModalOpen &&
        selectedResult &&
        createPortal(
          <>
            <div
              id="modal-overlay"
              className="fixed inset-0 bg-black/10 z-[999] backdrop-blur-sm"
              onClick={handleModalClose}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              className="fixed inset-0 z-[1000] flex items-center justify-center"
            >
              <div className="bg-background-primary rounded-lg">
                {selectedResult.type === 'job' ? (
                  <EditJobModal
                    job={selectedResult.item as Job}
                    onClose={handleModalClose}
                    onSave={handleJobUpdate}
                    onDelete={handleJobDelete}
                  />
                ) : (
                  <EditTagModal
                    tag={selectedResult.item as Tag}
                    onClose={handleModalClose}
                    onSave={handleTagUpdate}
                    onDelete={handleTagDelete}
                  />
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { SearchableItem, SearchResult } from '../../types/SearchBarItemType';
import { SearchBarItem } from '../SearchBarItem/SearchBarItem';
import { useJobStore } from '../../context/jobStore';
import { useTagStore } from '../../context/tagStore';

import { createPortal } from 'react-dom';
import { EditJobModal } from '../EditJobModal/EditJobModal';

import { Job } from '../../types/job';
import { Tag, TagMap } from '../../types/tag';

interface SearchBarProps {}

export function SearchBar() {
  const jobs = useJobStore((state) => state.jobs);
  const updateJob = useJobStore((state) => state.updateJob);
  const deleteJob = useJobStore((state) => state.deleteJob);
  const tags: TagMap = useTagStore((state) => state.tagMap);

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getSearchMatches = useCallback(
    (term: string) => {
      const lCaseTerm: string = term.toLowerCase();
      const results: SearchableItem[] = [];
      const seenIds = new Set<string>();

      jobs.forEach((job: Job) => {
        if (
          (job.company.toLowerCase().includes(lCaseTerm) ||
            job.position.toLowerCase().includes(lCaseTerm)) &&
          !seenIds.has(job.id)
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
    setSelectedJob(null);
    setIsModalOpen(false);
  }

  async function handleJobUpdate(updatedJob: Job) {
    console.log('handling update');
    if (!updatedJob) return;

    // ensure job actually changed
    if (
      selectedJob &&
      updatedJob &&
      JSON.stringify(selectedJob) === JSON.stringify(updatedJob)
    ) {
      return;
    }

    await updateJob(updatedJob);
    handleModalClose();
  }

  async function handleJobDelete(deletedJob: Job) {
    console.log('handling delete');
    if (!deletedJob) return;

    await deleteJob(deletedJob);
    handleModalClose();
  }

  function handleSuggestionSelection(suggestion: SearchResult) {
    setSelectedJob(suggestion.item as Job);
    setIsModalOpen(true);
  }

  useEffect(() => {
    if (searchTerm && searchTerm !== '') getSearchMatches(searchTerm);
  }, [searchTerm]);

  return (
    <div className="p-2 transition-colors duration-text text-text-primary">
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        className="bg-background-secondary text-text-primary placeholder:text-text-secondary rounded-lg"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="absolute bg-background-primary rounded-lg shadow-lg mt-2">
        {searchResults.map((sbItem: SearchResult) => (
          <div
            key={sbItem.item.id}
            className="p-2 hover:bg-background-secondary cursor-pointer"
            onClick={() => handleSuggestionSelection(sbItem)}
          >
            <SearchBarItem item={sbItem} />
          </div>
        ))}
      </div>

      {isModalOpen &&
        selectedJob &&
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
                <h2 id="modal-title">Edit Job</h2>
                <EditJobModal
                  job={selectedJob}
                  onClose={handleModalClose}
                  onSave={handleJobUpdate}
                  onDelete={handleJobDelete}
                />
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}

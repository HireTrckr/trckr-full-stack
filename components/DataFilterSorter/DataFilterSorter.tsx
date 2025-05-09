import React, { useState } from 'react';
import { FiSearch, FiFilter, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useTagStore } from '../../context/tagStore';
import { useTranslation } from 'react-i18next';
import { useStatusStore } from '../../context/statusStore';
import { getTailwindColorObjectFromName } from '../../utils/getTailwindColorObject';

// Define types for props
export type SortField = 'company' | 'position' | 'dateApplied' | 'status';
export type SortDirection = 'asc' | 'desc';
export type FilterOptions = {
  status: string[];
  searchTerm: string;
  tags: string[];
};

interface DataFilterSorterProps {
  sortField: SortField;
  sortDirection: SortDirection;
  filterOptions: FilterOptions;
  onSortChange: (field: SortField) => void;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
}

export function DataFilterSorter({
  sortField,
  sortDirection,
  filterOptions,
  onSortChange,
  onFilterChange,
}: DataFilterSorterProps): React.ReactElement {
  const { t } = useTranslation();
  const { tagMap } = useTagStore.getState();
  const { statusMap } = useStatusStore.getState();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ searchTerm: e.target.value });
  };

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    const newStatuses = filterOptions.status.includes(status)
      ? filterOptions.status.filter((s) => s !== status)
      : [...filterOptions.status, status];

    onFilterChange({ status: newStatuses });
  };

  // Handle tag filter change
  const handleTagChange = (tagId: string) => {
    const newTags = filterOptions.tags.includes(tagId)
      ? filterOptions.tags.filter((t) => t !== tagId)
      : [...filterOptions.tags, tagId];

    onFilterChange({ tags: newTags });
  };

  // Render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;

    return sortDirection === 'asc' ? (
      <FiChevronUp className="ml-1" />
    ) : (
      <FiChevronDown className="ml-1" />
    );
  };

  const handleFilterClearAll = () => {
    onFilterChange({
      status: [],
      searchTerm: '',
      tags: [],
    });
  };

  return (
    <div className="mb-4">
      {/* Search and filter controls */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Search input */}
        <div className="relative flex-grow">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('filter.search-placeholder')}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background-primary border border-background-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary placeholder-text-secondary/50 transition-all duration-text focus:text-text-primary text-text-secondary"
            value={filterOptions.searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Filter toggle button */}
        <button
          className={`px-4 py-2 rounded-lg flex items-center gap-2 text-text-primary transition-all duration-text ${isFilterOpen ? 'bg-background-secondary ring-2 ring-accent-primary' : 'border border-background-secondary'}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <FiFilter />
          {filterOptions.status.length + filterOptions.tags.length > 0 ? (
            <span className="text-text-primary flex items-center justify-center">
              {t('filter.filters')} (
              {filterOptions.status.length + filterOptions.tags.length})
            </span>
          ) : (
            <span>{t('filter.filters')}</span>
          )}
        </button>
      </div>
      {/* Filter panel */}
      {isFilterOpen && (
        <div className="bg-background-secondary p-4 pb-2 rounded-lg mb-3 ring-2 ring-accent-primary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status filters */}
            {Object.values(statusMap).length !== 0 && (
              <div>
                <h3 className="font-medium mb-2 text-text-primary transition-colors duration-text">
                  {t('filter.status')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.values(statusMap).map((status) => {
                    const color = getTailwindColorObjectFromName(status.color);
                    if (!color) return null;

                    return (
                      <button
                        key={status.id}
                        className={`px-3 py-1 rounded-full text-sm bg-${color.tailwindColorName}-300 ${filterOptions.status.includes(status.id) ? 'font-bold' : ''}`}
                        style={{ color: color.textColor }}
                        onClick={() => handleStatusChange(status.id)}
                      >
                        {status.deletable
                          ? status.statusName
                          : t(status.statusName)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tag filters */}
            {Object.values(tagMap).length !== 0 && (
              <div>
                <h3 className="font-medium mb-2 text-text-primary transition-colors duration-text">
                  {t('filter.tags')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.values(tagMap).map((tag) => {
                    const color = getTailwindColorObjectFromName(tag.color);
                    return (
                      <button
                        key={tag.id}
                        className={`px-3 py-1 rounded-full text-sm bg-${color.tailwindColorName}-300 ${filterOptions.tags.includes(tag.id) ? 'font-bold' : ''}`}
                        style={{
                          color: color.textColor,
                        }}
                        onClick={() => handleTagChange(tag.id)}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-row-reverse">
            <button
              onClick={() => {
                handleFilterClearAll();
              }}
            >
              <span className="text-xs text-text-secondary hover:underline ">
                Clear All
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Sorting options */}
      <div className="flex flex-wrap gap-4 mb-3 text-sm">
        <span className="font-medium text-text-primary">
          {t('filter.sort-by')}:
        </span>
        <button
          className={`flex items-center ${sortField === 'company' ? 'font-bold text-text-primary' : 'text-text-secondary'}`}
          onClick={() => onSortChange('company')}
        >
          {t('filter.company')}
          {renderSortIndicator('company')}
        </button>
        <button
          className={`flex items-center ${sortField === 'position' ? 'font-bold text-text-primary' : 'text-text-secondary'}`}
          onClick={() => onSortChange('position')}
        >
          {t('filter.position')}
          {renderSortIndicator('position')}
        </button>
        <button
          className={`flex items-center ${sortField === 'dateApplied' ? 'font-bold text-text-primary' : 'text-text-secondary'}`}
          onClick={() => onSortChange('dateApplied')}
        >
          {t('filter.date')}
          {renderSortIndicator('dateApplied')}
        </button>
        <button
          className={`flex items-center ${sortField === 'status' ? 'font-bold text-text-primary' : 'text-text-secondary'}`}
          onClick={() => onSortChange('status')}
        >
          {t('filter.status')}
          {renderSortIndicator('status')}
        </button>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { Tag } from '../../types/tag';

import { TAGS_PER_RECORD, useTagStore } from '../../context/tagStore';
import { TagCard } from '../TagCard/TagCard';

// Define interface for new tags that haven't been saved to Firestore yet
interface NewTag extends Tag {
  isNew: boolean;
}

interface TagEditorProps {
  tagIds: Tag['id'][];
  onTagsChange?: (tagIds: Tag['id'][], newTags?: NewTag[]) => void;
}

// Helper function to generate a random color (You might want to move this elsewhere)
const getRandomColor = (): string => {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#84cc16', // lime
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#d946ef', // fuchsia
    '#ec4899', // pink
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export function TagEditor({ tagIds, onTagsChange }: TagEditorProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  // Initialize tags from props, but only on mount
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    () => tagIds || []
  );
  // Keep track of new tags created in this session
  const [newTags, setNewTags] = useState<NewTag[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedTagIds(tagIds || []);
  }, [tagIds]);

  // Store the onTagsChange callback in a ref to avoid it causing re-renders
  const onTagsChangeRef = useRef(onTagsChange);
  useEffect(() => {
    onTagsChangeRef.current = onTagsChange;
  }, [onTagsChange]);

  // Get store values
  const tagMap = useTagStore((state) => state.tagMap);
  const getRecentTags = useTagStore((state) => state.getRecentTags);
  const isLoading = useTagStore((state) => state.isLoading);

  // Handle clicks outside the component to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputContainerRef.current &&
        !inputContainerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsInputFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus the input when clicking anywhere in the container
  const focusInput = () => {
    inputRef.current?.focus();
    setIsInputFocused(true);
  };

  // Filter suggestions based on input
  useEffect(() => {
    let isMounted = true;

    if (!inputValue.trim()) {
      // Show recent tags when input is empty
      const recentTags = getRecentTags(5).filter(
        (tag) => !selectedTagIds.includes(tag.id)
      );
      if (isMounted) {
        setSuggestions(recentTags);
      }
      return;
    }

    const matchingTags = Object.values(tagMap)
      .filter(
        (tag) =>
          !selectedTagIds.includes(tag.id) &&
          (tag.name.toLowerCase().includes(inputValue.toLowerCase()) ||
            tag.id.includes(inputValue.toLowerCase()))
      )
      .slice(0, 5);

    if (isMounted) {
      setSuggestions(matchingTags);
    }

    return () => {
      isMounted = false;
    };
  }, [inputValue, selectedTagIds, tagMap, getRecentTags]);

  // Update callback for tags - memoized to prevent recreating on each render
  const updateTags = useCallback(
    (tagIds: string[]) => {
      setSelectedTagIds(tagIds);
      // Use the ref to get the latest callback
      if (onTagsChangeRef.current) {
        onTagsChangeRef.current(tagIds, newTags);
      }
    },
    [newTags]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Check if the input contains a comma
    if (value.includes(',')) {
      // Split by comma and handle each part
      const parts = value.split(',');

      // Process all parts except the last one as new tags
      const validParts = parts.slice(0, -1).filter((part) => part.trim());
      for (const tagText of validParts) {
        addTagIfNotExists(tagText.trim());
      }

      // Set the input value to the last part
      setInputValue(parts[parts.length - 1].trim());
    } else {
      setInputValue(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to remove last tag when input is empty
    if (e.key === 'Backspace' && !inputValue && selectedTagIds.length > 0) {
      const newTags = [...selectedTagIds];
      const lastTagId = newTags.pop() as string;
      updateTags(newTags);
    }
  };

  const addTagIfNotExists = (tagName: string) => {
    if (selectedTagIds.length >= TAGS_PER_RECORD) {
      return;
    }

    // Check if this is a new tag or existing one
    const normalizedTagId = tagName.toLowerCase().replace(/\s+/g, '-');

    // Check if this tag already exists
    const existingTag = tagMap[normalizedTagId];

    // Check if it's in our new tags list
    const isInNewTags = newTags.some((tag) => tag.id === normalizedTagId);

    if (!existingTag && !isInNewTags) {
      // Create a new tag locally if it doesn't exist
      const newTag: NewTag = {
        id: normalizedTagId,
        name: tagName,
        color: getRandomColor(),
        count: 1,
        timestamps: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isNew: true,
      };

      // Add to our local new tags list
      setNewTags((prev) => [...prev, newTag]);
    }

    if (!selectedTagIds.includes(normalizedTagId)) {
      const updatedTagIds = [...selectedTagIds, normalizedTagId];
      updateTags(updatedTagIds);
    }

    setInputValue('');
  };

  const addTagToSelection = (tagId: string) => {
    if (
      selectedTagIds.includes(tagId) ||
      selectedTagIds.length >= TAGS_PER_RECORD
    ) {
      return;
    }

    const updatedTagIds = [...selectedTagIds, tagId];
    updateTags(updatedTagIds);
    setInputValue('');
  };

  const removeTag = (tagId: string) => {
    const newTags = selectedTagIds.filter((id) => id !== tagId);
    updateTags(newTags);
  };

  const handleSuggestionClick = (tagId: string) => {
    addTagToSelection(tagId);
    // Keep input focused but close dropdown
    inputRef.current?.focus();
    setIsInputFocused(true);
  };

  // Function to get tag object by ID with safety check
  const getTag = (tagId: string): Tag | undefined => {
    // First check in the regular tag map
    const existingTag = tagMap[tagId];
    if (existingTag) {
      return existingTag;
    }

    // If not found, check in our new tags
    const newTag = newTags.find((tag) => tag.id === tagId);
    return newTag;
  };

  return (
    <div className="w-full">
      <div
        ref={inputContainerRef}
        className="flex flex-wrap gap-2 items-center w-full px-4 py-2 rounded-lg bg-background-primary text-text-primary border border-background-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-accent focus-within:ring-opacity-50 focus-within:bg-background-secondary placeholder-text-secondary/50 transition-all duration-text cursor-text"
        onClick={focusInput}
      >
        {selectedTagIds.map((tagId) => {
          const tag = getTag(tagId);

          if (!tag) {
            return null;
          }

          return (
            <TagCard
              key={tagId}
              tag={tag}
              onRemoveButtonClick={() => removeTag(tagId)}
            />
          );
        })}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsInputFocused(true)}
          className="flex-grow min-w-[120px] bg-transparent outline-none border-none p-1 placeholder-text-secondary/50 text-text-primary"
          placeholder={
            selectedTagIds.length >= TAGS_PER_RECORD
              ? `Maximum ${TAGS_PER_RECORD} tags reached`
              : selectedTagIds.length === 0
                ? 'Add tags (comma or enter to separate)'
                : ''
          }
          disabled={selectedTagIds.length >= TAGS_PER_RECORD || isLoading}
        />
      </div>

      <div className="relative">
        {isInputFocused && (
          <div
            ref={dropdownRef}
            className="absolute right-0 top-full w-3/4 !mt-0 z-10 overflow-auto border border-accent-primary rounded-lg shadow-light text-text-primary bg-background-secondary"
          >
            {suggestions.map((tag) => (
              <button
                key={tag.id}
                className={
                  'block px-4 py-2 text-sm rounded-lg w-full text-left capitalize transition-all duration-text hover:bg-background-primary bg-background-secondary'
                }
                onClick={() => handleSuggestionClick(tag.id)}
              >
                <div className="flex items-center">
                  <span>{tag.name}</span>
                  <span className="ml-2 text-xs">{`(${tag.count} uses)`}</span>
                </div>
              </button>
            ))}
            {inputValue &&
              newTags
                .filter(
                  (tag) =>
                    !selectedTagIds.includes(tag.id) &&
                    tag.name.toLowerCase().includes(inputValue.toLowerCase())
                )
                .map((tag) => (
                  <div
                    key={tag.id}
                    className="px-4 py-2 cursor-pointer bg-background-secondary"
                    onClick={() => handleSuggestionClick(tag.id)}
                  >
                    <div className="flex items-center text-sm text-text-secondary">
                      <span>{tag.name}</span>
                      <span className="ml-2">(new)</span>
                    </div>
                  </div>
                ))}
            {suggestions.length === 0 && inputValue && (
              <div
                className="px-4 py-2 cursor-pointer bg-background-primary"
                onClick={() => addTagIfNotExists(inputValue.trim())}
              >
                <div className="flex items-center">
                  <span className="mr-2 text-green-500">+</span>
                  <span className="text-text-primary text-sm">
                    Create new tag: "{inputValue}"
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-1 text-sm text-gray-500">
        {selectedTagIds.length}/{TAGS_PER_RECORD} tags used
      </div>
    </div>
  );
}

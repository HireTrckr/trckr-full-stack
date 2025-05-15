import { useState, useRef } from 'react';
import { Tag } from '../../types/tag';

import { TAGS_PER_RECORD, useTagStore } from '../../context/tagStore';
import { TagCard } from '../TagCard/TagCard';
import { getRandomTailwindColor } from '../../utils/generateRandomColor';
import { useTranslation } from 'react-i18next';
import { getIDFromName } from '../../utils/idUtils';
import { Timestamp } from 'firebase/firestore';

interface TagEditorProps {
  tagIds: Tag['id'][];
  onTagsChange: (tagIds: Tag['id'][], newTagNames: Partial<Tag>[]) => void;
}

export function TagEditor({ tagIds, onTagsChange }: TagEditorProps) {
  const { tagMap } = useTagStore.getState();
  const { t } = useTranslation();

  const [selectedExistingTagIds, setSelectedExistingTagIds] = useState<
    Set<Tag['id']>
  >(new Set(tagIds));
  const [selectedNewTagNames, setSelectedNewTagNames] = useState<
    Set<Partial<Tag>>
  >(new Set());
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  const inputContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set state helpers
  function addToSelectedExistingTagIds(tagId: Tag['id']) {
    setSelectedExistingTagIds((prev) => new Set(prev).add(tagId));
  }
  function removeFromSelectedExistingTagIds(tagId: Tag['id']) {
    setSelectedExistingTagIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(tagId);
      return newSet;
    });
  }
  function addToSelectedNewTagNames(tagName: Tag['name']) {
    setSelectedNewTagNames((prev) =>
      new Set(prev).add({
        name: tagName,
        color: getRandomTailwindColor().tailwindColorName,
      })
    );
  }

  function removeFromSelectedNewTagNames(tagName: Tag['name']) {
    // find the tag in the set that has the same name and delete it from set
    const tag = Array.from(selectedNewTagNames).find(
      (tag: Partial<Tag>) => tag.name === tagName
    );
    if (tag) {
      selectedNewTagNames.delete(tag);
    }
    onTagsChange(
      Array.from(selectedExistingTagIds),
      Array.from(selectedNewTagNames)
    );
  }

  function removeTag(tagId: Tag['id']) {
    removeFromSelectedExistingTagIds(tagId);
    onTagsChange(
      Array.from(selectedExistingTagIds),
      Array.from(selectedNewTagNames)
    );
  }
  function handleSuggestionClick(suggestionId: Tag['id']) {
    addToSelectedExistingTagIds(suggestionId);
    setInputValue('');
    setSuggestions([]);
    onTagsChange(
      Array.from(selectedExistingTagIds),
      Array.from(selectedNewTagNames)
    );
  }

  function selectNewTag(tagName: Tag['name']) {
    addToSelectedNewTagNames(tagName);
    setInputValue('');
    setSuggestions([]);
    onTagsChange(
      Array.from(selectedExistingTagIds),
      Array.from(selectedNewTagNames)
    );
  }
  function unSelectNewTag(tagName: Tag['name']) {
    removeFromSelectedNewTagNames(tagName);
    onTagsChange(
      Array.from(selectedExistingTagIds),
      Array.from(selectedNewTagNames)
    );
  }

  // input functions
  function handleInputChange() {
    if (inputRef.current) {
      const value = inputRef.current.value;
      setInputValue(value);

      if (!value.trim()) {
        setSuggestions([]);
        return;
      }

      const newSuggestions = Object.values(tagMap)
        .filter((tag) => {
          return (
            tag.name.toLowerCase().includes(value.toLowerCase()) &&
            !selectedExistingTagIds.has(tag.id)
          );
        })
        .slice(0, 5);

      setSuggestions(newSuggestions);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && inputValue === '') {
      if (selectedNewTagNames.size > 0) {
        const lastTagName = Array.from(selectedNewTagNames).pop();
        if (lastTagName && lastTagName.name)
          removeFromSelectedNewTagNames(lastTagName.name);
      } else {
        const lastTagId = Array.from(selectedExistingTagIds).pop();
        if (lastTagId) removeFromSelectedExistingTagIds(lastTagId);
      }
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[0].id);
      } else if (inputValue !== '') {
        selectNewTag(inputValue);
      }
    }
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex gap-2 max-w-full overflow-x-scroll">
        {Array.from(selectedExistingTagIds).map((tagId: Tag['id']) => {
          const tag = tagMap[tagId];

          if (!tag) {
            removeFromSelectedExistingTagIds(tagId);
            return null;
          }

          return (
            <TagCard
              key={tagId}
              tag={tag}
              onRemoveButtonClick={() => removeTag(tagId)}
              editable={true}
            />
          );
        })}
        {Array.from(selectedNewTagNames).map((tag: Partial<Tag>) => {
          if (!tag.name || !tag.color) return;
          const newTagId = getIDFromName(tag.name);

          return (
            <TagCard
              key={newTagId}
              tag={{
                id: newTagId,
                name: tag.name,
                color: tag.color,
                count: 0,
                timestamps: {
                  createdAt: Timestamp.fromDate(new Date()),
                  updatedAt: Timestamp.fromDate(new Date()),
                  deletedAt: null,
                },
              }}
              onRemoveButtonClick={() => unSelectNewTag(tag.name!)}
              editable={true}
            />
          );
        })}
      </div>
      <div
        ref={inputContainerRef}
        className="flex gap-2 items-center w-full px-4 py-2 rounded-lg bg-background-primary text-text-primary border border-background-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-accent-primary focus-within:ring-opacity-50 focus-within:bg-background-secondary placeholder-text-secondary/50 transition-all duration-text cursor-text"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow min-w-full bg-transparent outline-none border-none placeholder-text-secondary/50 text-text-primary"
          placeholder={
            selectedExistingTagIds.size + selectedNewTagNames.size >=
            TAGS_PER_RECORD
              ? t('tag-editor.placeholder_max', { count: TAGS_PER_RECORD })
              : selectedExistingTagIds.size === 0 ||
                  selectedNewTagNames.size === 0
                ? t('tag-editor.placeholder_empty')
                : ''
          }
          disabled={
            selectedExistingTagIds.size + selectedNewTagNames.size >=
            TAGS_PER_RECORD
          }
        />
      </div>

      {inputValue && (
        <div className="relative">
          <div
            ref={dropdownRef}
            className="absolute right-0 top-full w-3/4 !mt-0 z-10 overflow-auto border border-accent-primary rounded-lg shadow-light text-text-primary bg-background-secondary"
          >
            {inputValue.trim() &&
              suggestions.map((tag) => (
                <button
                  key={tag.id}
                  className="block px-4 py-2 text-sm rounded-lg w-full text-left transition-all duration-text hover:bg-background-primary bg-background-secondary"
                  onClick={() => handleSuggestionClick(tag.id)}
                >
                  <div className="flex items-center">
                    <span>{tag.name}</span>
                    <span className="ml-2 text-xs">
                      {t('tag-editor.tag-uses', { count: tag.count })}
                    </span>
                  </div>
                </button>
              ))}
            <div
              className="px-4 py-2 cursor-pointer bg-background-primary"
              onClick={() => selectNewTag(inputValue.trim())}
            >
              <div className="flex items-center">
                <span className="mr-2 text-green-500">+</span>
                <span className="text-text-primary text-sm">
                  {t('tag-editor.create-new-tag', { tag: inputValue })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-1 text-sm text-gray-500">
        {t('tag-editor.tags-used', {
          count: selectedExistingTagIds.size + selectedNewTagNames.size,
          limit: TAGS_PER_RECORD,
        })}
      </div>
    </div>
  );
}

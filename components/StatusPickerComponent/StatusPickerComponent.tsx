import React, { JSX, useState } from 'react';
import { TiArrowSortedDown } from 'react-icons/ti';
import { JobStatus } from '../../types/jobStatus';
import { useStatusStore } from '../../context/statusStore';
import { Job } from '../../types/job';
import { useTranslation } from 'react-i18next';

interface StatusPickerComponentProps {
  initialStatusID: Job['statusID'];
  onSelect: (status: JobStatus) => void;
}

export function StatusPickerComponent({
  initialStatusID,
  onSelect,
}: StatusPickerComponentProps): JSX.Element {
  const { statusMap, getStatusFromID } = useStatusStore.getState();
  const [statusDropDownOpen, setStatusDropDownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<JobStatus>(
    getStatusFromID(initialStatusID)
  );
  const statusDropDownButtonRef = React.useRef<HTMLButtonElement>(null);
  const statusDropDownRef = React.useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const handleSelect = (status: JobStatus) => {
    setSelectedStatus(status);
    onSelect(status);
    setStatusDropDownOpen(false);
  };

  return (
    <>
      <button
        className="w-full px-4 py-2 rounded-lg flex justify-between items-center relative bg-background-primary text-text-primary border border-background-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 transition-all duration-text text-left"
        onClick={() => setStatusDropDownOpen(!statusDropDownOpen)}
        ref={statusDropDownButtonRef}
        type="button"
      >
        {selectedStatus.deletable
          ? selectedStatus.statusName
          : t(selectedStatus.statusName)}
        <TiArrowSortedDown
          className={`${
            statusDropDownOpen ? 'rotate-0' : 'rotate-90'
          } transition-all text-text-primary duration-text`}
        />
      </button>
      {statusDropDownOpen && (
        <div
          className="absolute right-0 top-full w-3/4 !mt-0 bg-background-secondary border border-accent-primary rounded-lg shadow-light text-text-primary z-50 max-h-full overflow-y-auto
                "
          ref={statusDropDownRef}
          onMouseLeave={() => setStatusDropDownOpen(false)}
        >
          {Object.values(statusMap)
            .sort((a, b) => {
              // sort alphabetically
              return a.statusName.localeCompare(b.statusName);
            })
            .map((status: JobStatus) => (
              <button
                key={status.id}
                className={`block px-4 py-2 text-sm hover:bg-background-primary rounded-lg w-full text-left transition-all duration-bg ease-in-out z-1 ${
                  selectedStatus.id === status.id
                    ? 'bg-background-primary text-text-primary'
                    : 'text-text-secondary'
                }`}
                role="menuitem"
                onClick={() => handleSelect(status)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSelect(status);
                  }
                }}
              >
                {status.deletable ? status.statusName : t(status.statusName)}
              </button>
            ))}
        </div>
      )}
    </>
  );
}

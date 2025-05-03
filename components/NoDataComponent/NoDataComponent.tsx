// components/common/EmptyState.tsx
import React from 'react';
import { IconType } from 'react-icons';
import { FiInbox } from 'react-icons/fi';

interface NoDataComponentProps {
  title: string;
  message: string;
  icon?: IconType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const NoDataComponent: React.FC<NoDataComponentProps> = ({
  title,
  message,
  icon: Icon = FiInbox,
  action,
}) => {
  return (
    <div
      className="w-full flex-1 flex flex-col items-center justify-center text-center space-y-4"
      role="status"
      aria-label={title}
    >
      <Icon className="w-12 h-12 text-accent-primary" aria-hidden="true" />
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary max-w-sm">{message}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary hover:brightness-[80%] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

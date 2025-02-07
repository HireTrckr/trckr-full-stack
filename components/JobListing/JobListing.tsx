import React, { JSX, useEffect, useRef } from "react";
import { Job } from "../../context/jobStore";
import { useState, memo } from "react";

const JobListing = memo(
  function JobListing({
    job,
    onUpdate,
    onEdit,
  }: {
    job: Job;
    onUpdate?: (updatedJob: Job) => void;
    onEdit: (jobId: Job["id"]) => void;
  }): JSX.Element {
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const getStatusColor = (status: Job["status"]): string => {
      const baseClasses =
        "text-white p-2 rounded-lg bg-opacity-50 capitalize cursor-pointer inline-block text-center min-w-[85px]";

      switch (status) {
        case "applied":
          return `bg-blue-500 ${baseClasses}`;
        case "interview":
          return `bg-yellow-500 ${baseClasses}`;
        case "offer":
          return `bg-green-500 ${baseClasses}`;
        case "rejected":
          return `bg-red-500 ${baseClasses}`;
        default:
          return `bg-gray-500 ${baseClasses}`;
      }
    };

    const updateStatus = (newStatus: Job["status"]) => {
      const updatedJob = { ...job, status: newStatus };
      onUpdate?.(updatedJob);
      setIsDropDownOpen(false);
    };

    const statusOptions: Job["status"][] = [
      "applied",
      "interview",
      "offer",
      "rejected",
    ];

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsDropDownOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div
        ref={dropdownRef}
        className="relative flex items-center justify-between"
      >
        {job.company} | {job.position} | {job.location}
        <span
          onClick={() => setIsDropDownOpen(!isDropDownOpen)}
          className={getStatusColor(job.status)}
        >
          {job.status}
        </span>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => onEdit(job.id)} // Pass job ID to the handler
        >
          Edit
        </button>
        {isDropDownOpen && (
          <div className="absolute mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {statusOptions.map((status: Job["status"]) => (
              <button
                key={status}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left capitalize
                  ${job.status === status ? "bg-gray-100" : ""}`}
                onClick={() => updateStatus(status)}
                role="menuitem"
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.job.id === nextProps.job.id &&
      prevProps.job.status === nextProps.job.status &&
      prevProps.job.company === nextProps.job.company &&
      prevProps.job.position === nextProps.job.position &&
      prevProps.job.location === nextProps.job.location
    );
  }
);

export default JobListing;

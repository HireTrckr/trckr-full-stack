import { Job } from "../context/jobStore";

export const getStatusColor = (status: Job["status"]): string => {
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

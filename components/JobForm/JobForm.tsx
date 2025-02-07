import { useState } from "react";
import { useJobStore, Job } from "../../context/jobStore";

export default function JobForm() {
  const { addJob } = useJobStore();
  const [job, setJob] = useState({
    company: "",
    position: "",
    status: "applied",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job.company || !job.position) return;

    await addJob({
      ...job,
      status: job.status as Job["status"],
    });

    setJob({ company: "", position: "", status: "applied", location: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white shadow-md rounded-lg w-full max-w-sm"
    >
      <h2 className="text-lg font-semibold mb-2">Add Job</h2>
      <input
        type="text"
        placeholder="Company"
        className="border p-2 w-full mb-2"
        value={job.company}
        onChange={(e) => setJob({ ...job, company: e.target.value })}
      />
      <input
        type="text"
        placeholder="Position"
        className="border p-2 w-full mb-2"
        value={job.position}
        onChange={(e) => setJob({ ...job, position: e.target.value })}
      />
      <input
        type="text"
        placeholder="Location"
        className="border p-2 w-full mb-2"
        value={job.location}
        onChange={(e) => setJob({ ...job, location: e.target.value })}
      />
      <select
        className="border p-2 w-full mb-2"
        value={job.status}
        onChange={(e) => setJob({ ...job, status: e.target.value })}
      >
        <option value="applied">Applied</option>
        <option value="interview">Interview</option>
        <option value="offer">Offer</option>
        <option value="rejected">Rejected</option>
      </select>
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 w-full rounded"
      >
        Add Job
      </button>
    </form>
  );
}

import { useState } from "react";
import { useJobStore } from "../../context/jobStore";
import { RiArrowDropDownLine } from "react-icons/ri";
import { Job, statusOptions } from "../../types/job";
import { auth } from "../../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export function JobForm() {
  const { addJob } = useJobStore();
  const [job, setJob] = useState({
    company: "",
    position: "",
    status: "applied",
    location: "",
  });

  const [dropDownOpen, setDropDownOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job.company || !job.position) return;

    await addJob({
      ...job,
      status: job.status as Job["status"],
      timestamps: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    setJob({
      company: "",
      position: "",
      status: "applied" as Job["status"],
      location: "",
    });
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        return;
      }
      console.error("Login failed", error);
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="flex flex-col justify-center items-center gap-2 py-8">
        <span className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text capitalize mb-6">
          please sign in to continue
        </span>
        <button
          onClick={signInWithGoogle}
          className="px-3 py-1.5 rounded-lg text-sm font-medium
               bg-accent-primary hover:bg-accent-hover
               text-white
               transition-all duration-text ease-in-out
               flex items-center gap-2 shadow-light
                 "
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center items-center mb-6">
        <h2 className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text capitalize">
          track a new application
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-3 relative">
          <input
            type="text"
            placeholder="Company"
            className="w-full px-4 py-2 rounded-lg
                     bg-background-primary 
                     text-text-primary
                     border border-background-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 focus:bg-background-secondary
                     placeholder-text-secondary/50
                     transition-all duration-text"
            value={job.company}
            onChange={(e) => setJob({ ...job, company: e.target.value })}
          />
          <input
            type="text"
            placeholder="Position"
            className="w-full px-4 py-2 rounded-lg
                     bg-background-primary 
                     text-text-primary
                     border border-background-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 focus:bg-background-secondary
                     placeholder-text-secondary/50
                     transition-all duration-text"
            value={job.position}
            onChange={(e) => setJob({ ...job, position: e.target.value })}
          />
          <input
            type="text"
            placeholder="Location (optional)"
            className="w-full px-4 py-2 rounded-lg
                     bg-background-primary 
                     text-text-primary
                     border border-background-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 focus:bg-background-secondary
                     placeholder-text-secondary/50
                     transition-all duration-text"
            value={job.location}
            onChange={(e) => setJob({ ...job, location: e.target.value })}
          />
          <button
            className="w-full px-4 py-2 rounded-lg flex justify-between items-center relative bg-background-primary text-text-primary border border-background-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 transition-all duration-text capitalize text-left"
            onClick={() => setDropDownOpen(!dropDownOpen)}
          >
            {job.status}
            <RiArrowDropDownLine
              className={`rotate-${
                dropDownOpen ? "270" : "90"
              } transition-all text-text-primary duration-text`}
            />
          </button>
          {dropDownOpen && (
            <div
              className="absolute right-0 top-full w-3/4 !mt-0 bg-background-secondary border border-accent-primary rounded-lg shadow-light text-text-primary z-50"
              onMouseEnter={() => setDropDownOpen(true)}
              onMouseLeave={() => setDropDownOpen(false)}
            >
              {statusOptions.map((status: Job["status"]) => (
                <button
                  key={status}
                  className={`block px-4 py-2 text-sm hover:bg-background-primary rounded-lg w-full text-left capitalize transition-all duration-bg ease-in-out z-1 ${
                    job.status === status
                      ? "bg-background-primary text-text-primary"
                      : "text-text-secondary"
                  }`}
                  role="menuitem"
                  onClick={() => {
                    setJob({ ...job, status });
                    setDropDownOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setJob({ ...job, status });
                      setDropDownOpen(false);
                    }
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white font-medium transition-all duration-bg disabled:opacity-50 disabled:cursor-not-allowed capitalize focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50"
          disabled={!job.company || !job.position}
        >
          add job
        </button>
      </form>
    </>
  );
}

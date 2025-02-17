export type Job = {
  id?: string;
  company: string;
  position: string;
  location: string;
  status: "applied" | "interview" | "offer" | "rejected";
};

export const statusOptions: Job["status"][] = [
  "applied",
  "interview",
  "offer",
  "rejected",
];

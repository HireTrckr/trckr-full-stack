import { JobList } from "../components/JobList/JobList";
import { JobForm } from "../components/JobForm/JobForm";
import "../styles/globals.css";
import Head from "next/head";

/*TODO:
i18n
system theme override
settings component
settings backend
maximum stack errors
job added popup / toast messages
location stuff
filter
search bar
add tag editor to editJobModal
due date (optional)
notes (optional)
confirmation popup for delete
make edit job modal responsive for when use adds a link
tag editor
tag category
tags
rate limiting for requests, creations, deletions, edits
changing tag color
*/

export default function Home() {
  return (
    <>
      <Head>
        <title>HireTrkr | Home</title>
      </Head>
      <main className="w-full flex flex-col items-center justify-center">
        <div className="w-full px-4 py-6 space-y-6">
          <div className="bg-background-primary rounded-lg p-6 shadow-light transition-all duration-bg ease-in-out flex flex-col items-center hover:scale-[1.02]">
            <div className="w-full">
              <JobForm />
            </div>
          </div>

          <div className="bg-background-primary rounded-lg p-6 shadow-light transition-all duration-bg ease-in-out flex flex-col items-center hover:scale-[1.02]">
            <div className="w-full">
              <JobList />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

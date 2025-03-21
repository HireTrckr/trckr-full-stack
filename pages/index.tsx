import { JobList } from '../components/JobList/JobList';
import { JobForm } from '../components/JobForm/JobForm';
import '../styles/globals.css';
import Head from 'next/head';

/*TODO:
*settings*
system theme override
settings component
settings backend

*modal*
confirmation popup for delete
make better link preview in modal
make edit job modal responsive for when use adds a link
add tag editor to editJobModal

*tags
complete tag system
make searchbar update tag when edited
tag editor - settings
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
      <main className="w-full flex flex-col items-center justify-center space-y-4">
        <div className="w-full bg-background-primary rounded-lg p-6 shadow-light transition-all duration-bg ease-in-out flex flex-col items-center hover:scale-[1.02]">
          <div className="w-full">
            <JobForm />
          </div>
        </div>

        <div className="w-full bg-background-primary rounded-lg p-6 shadow-light transition-all duration-bg ease-in-out flex flex-col items-center hover:scale-[1.02]">
          <div className="w-full">
            <JobList />
          </div>
        </div>
      </main>
    </>
  );
}

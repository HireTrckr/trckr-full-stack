import { JobList } from '../components/JobList/JobList';
import { JobForm } from '../components/JobForm/JobForm';
import '../styles/globals.css';
import Head from 'next/head';

/*TODO:
*settings*
system theme override
settings component

allow custom fields

skeleton page
pagination (if needed)

properly implement toast notifications (plus undo)
properly implement loading notifications

*modal*
confirmation popup for delete
make better link preview in modal

*tags
make searchbar update tag when edited
tag editor - settings
tags
rate limiting for requests, creations, deletions, edits
add loading spinner to joblisting delete button

this website uses cookies popup

add salary tag

fix tags lol again
*/

export default function Home() {
  return (
    <>
      <Head>
        <title>Trckr | Home</title>
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

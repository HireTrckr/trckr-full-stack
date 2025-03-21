import Head from 'next/head';
import { JobList } from '../components/JobList/JobList';

export default function List() {
  return (
    <>
      <Head>
        <title>Trckr | Applications</title>
      </Head>

      <div
        className="w-full bg-background-primary rounded-lg py-4 shadow-light
                       transition-all duration-bg ease-in-out
                       flex flex-col items-center
                       hover:scale-[1.02]"
      >
        <JobList />
      </div>
    </>
  );
}

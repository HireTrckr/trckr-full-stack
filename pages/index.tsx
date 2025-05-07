import { JobList } from '../components/JobList/JobList';
import { JobForm } from '../components/JobForm/JobForm';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Trckr | Home</title>
      </Head>

      <main className="w-full flex flex-col items-center justify-center space-y-4 gap-2">
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

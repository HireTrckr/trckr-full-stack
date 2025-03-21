import Head from 'next/head';
import { JobForm } from '../components/JobForm/JobForm';

export default function List() {
  return (
    <>
      <Head>
        <title>Trckr | New</title>
      </Head>
      <div
        className="bg-background-primary 
                           rounded-lg p-6
                           shadow-light
                           
                           transition-all duration-bg ease-in-out
                           flex flex-col items-center
                           hover:scale-[1.02]"
      >
        <div className="w-full">
          <JobForm />
        </div>
      </div>
    </>
  );
}

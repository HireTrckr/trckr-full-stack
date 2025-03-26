import Head from 'next/head';
import { Settings } from '../components/Settings/Settings';

export default function settings() {
  return (
    <>
      <Head>
        <title>Trckr | Settings</title>
      </Head>
      <div className="w-full bg-background-primary rounded-lg py-4 shadow-light transition-all duration-bg ease-in-out flex flex-col items-center hover:scale-[1.02]">
        <Settings />
      </div>
    </>
  );
}

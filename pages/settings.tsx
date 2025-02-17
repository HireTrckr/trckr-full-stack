import Head from "next/head";
import { Settings } from "../components/Settings/Settings";

export default function settings() {
  return (
    <>
      <Head>
        <title>HireTrkr | Settings</title>
      </Head>
      <Settings />
    </>
  );
}

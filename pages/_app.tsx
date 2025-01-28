import { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css"; // Import global styles if needed

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>HireTrkr | Home</title>
        <meta name="title" content="HireTrkr" />
        <meta name="og:title" content="HireTrkr" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;

import { AppProps } from "next/app";
import Head from "next/head";
import { ThemeProvider } from "../context/themeContext";
import "../styles/globals.css"; // Import global styles if needed

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Head>
        <title>HireTrkr | Home</title>
        <meta name="title" content="HireTrkr" />
        <meta name="og:title" content="HireTrkr" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;

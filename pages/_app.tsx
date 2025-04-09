import { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '../context/themeContext';
import '../styles/theme.css';
import '../styles/globals.css';
import { Layout } from '../components/Layout/Layout';
import { StrictMode } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StrictMode>
      <ThemeProvider>
        <Head>
          <title>Trckr</title>
          <meta name="title" content="Trckr" />
          <meta name="og:title" content="Trckr" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </StrictMode>
  );
}

export default MyApp;

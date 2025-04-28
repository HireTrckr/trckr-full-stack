import { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '../context/themeContext';
import '../styles/theme.css';
import '../styles/globals.css';
import { Layout } from '../components/Layout/Layout';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <Head>
          <title>Trckr</title>
          <meta name="title" content="Trckr" />
          <meta name="og:title" content="Trckr" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </I18nextProvider>
    </ThemeProvider>
  );
}

export default MyApp;

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
          <meta name="description" content="Track your job applications" />

          <meta
            name="keywords"
            content="Job, Jobs, Applications, Application Management, Job Application Tracking"
          />

          <meta property="og:url" content="https://hire-trckr.vercel.app" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Trckr" />
          <meta
            property="og:description"
            content="Track your job applications"
          />
          <meta
            property="og:image"
            content="https://hire-trckr.vercel.app/HireTrckr.png"
          />

          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content="hire-trckr.vercel.app" />
          <meta
            property="twitter:url"
            content="https://hire-trckr.vercel.app"
          />
          <meta name="twitter:title" content="Trckr" />
          <meta
            name="twitter:description"
            content="Track your job applications"
          />
          <meta
            name="twitter:image"
            content="https://hire-trckr.vercel.app/HireTrckr.png"
          />

          <meta name="author" content="Dylan Penney" />
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

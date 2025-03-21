// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta charSet="UTF-8" />

          <link rel="icon" href="/HireTrckr.png" />
          <link rel="apple-touch-icon" href="/HireTrckr.png" />

          <meta name="og:title" content="Trckr" />
          <meta name="twitter:title" content="Trckr" />

          <meta name="description" content="Track your job applications" />
          <meta name="og:description" content="Track your job applications" />
          <meta
            name="twitter:description"
            content="Track your job applications"
          />

          <meta name="og:image" content="/HireTrckr.png" />
          <meta name="twitter:image" content="/HireTrckr.png" />
        </Head>
        <body className='bg-background-secondary'>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

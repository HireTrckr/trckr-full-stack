// pages/_error.tsx
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-4xl font-bold text-text-primary mb-4">
        {statusCode ? `Error ${statusCode}` : 'An error occurred'}
      </h1>
      <p className="text-text-primary mb-6 transition-colors duration-text">
        {statusCode === 404
          ? "The page you're looking for doesn't exist."
          : 'Something went wrong.'}
      </p>
      <a
        href="/"
        className="px-4 py-2 bg-accent-primary text-text-accent rounded-md
                  hover:brightness-[80%] transition-colors duration-text"
      >
        Return Home
      </a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;

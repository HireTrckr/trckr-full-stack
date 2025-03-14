import { AuthCheck } from '../AuthCheck/AuthCheck';
import { LoadingIndicator } from '../LoadingIndicator/LoadingIndicator';
import { Navbar } from '../Navbar/Navbar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen min-w-screen max-w-screen bg-background-secondary flex flex-col items-center z-0">
      <Navbar />
      <AuthCheck>
        <main className="container mx-auto px-4 py-16 flex-1 z-0">{children}</main>
      </AuthCheck>
      <LoadingIndicator />
    </div>
  );
}

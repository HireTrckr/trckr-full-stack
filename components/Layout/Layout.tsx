import { AuthCheck } from '../AuthCheck/AuthCheck';
import { LoadingIndicator } from '../LoadingIndicator/LoadingIndicator';
import { Navbar } from '../Navbar/Navbar';
import { ToastsComponent } from '../ToastsComponent/ToastsComponent';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen min-w-screen max-w-screen bg-background-secondary flex flex-col items-center z-0">
      <Navbar />
      <div className="w-full px-6 py-16 flex-1 z-0">
        <AuthCheck>
          <ToastsComponent />
          <main className="w-full space-y-6">{children}</main>
          <LoadingIndicator />
        </AuthCheck>
      </div>
    </div>
  );
}

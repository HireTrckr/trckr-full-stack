import { AuthCheck } from "../AuthCheck/AuthCheck";
import { Navbar } from "../Navbar/Navbar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-secondary flex flex-col items-center">
      <Navbar />
      <AuthCheck>
        <main className="container mx-auto px-4 py-8 flex-1">{children}</main>
      </AuthCheck>
    </div>
  );
}

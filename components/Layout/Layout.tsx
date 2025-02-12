import Navbar from "../Navbar/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-secondary flex flex-col items-center">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1">{children}</main>
    </div>
  );
}

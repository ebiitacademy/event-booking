import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-grow px-4 py-8 sm:px-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}

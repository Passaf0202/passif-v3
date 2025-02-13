
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 md:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

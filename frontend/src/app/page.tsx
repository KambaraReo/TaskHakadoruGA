import { Header } from "@/components/Header";
import { MainContent } from "@/components/MainContent";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen app-container">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <MainContent />
        <Footer />
      </div>
    </div>
  );
}

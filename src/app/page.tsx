import Activities from "@/components/Activities";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Tours from "@/components/Tours";
import Transfer from "@/components/Transfer";
import Header from "@/shared/header";

export default function Home() {
  return (
    <main className="flex-rows min-h-screen items-center justify-center bg-gray-100">
      <Header />
      <Hero />
      <Activities />
      <Tours />
      <Transfer />
      <Footer />
    </main>
  );
}

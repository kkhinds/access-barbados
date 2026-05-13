import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import BookingForm from "@/components/BookingForm";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MobileActionBar from "@/components/MobileActionBar";

export default function Page() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Services />
        <About />
        <BookingForm />
        <Contact />
      </main>
      <Footer />
      <MobileActionBar />
    </>
  );
}

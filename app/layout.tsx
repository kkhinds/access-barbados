import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Access Barbados | Reliable Wheelchair-Accessible Rides",
  description:
    "Accessible transport across Barbados. Rides to the doctor, physio, the pharmacy, the supermarket, and beyond. For residents who need a little extra care getting around.",
  keywords: [
    "wheelchair accessible taxi Barbados",
    "disability transport Barbados",
    "accessible rides Barbados",
    "wheelchair transport Bridgetown",
    "medical appointment transport Barbados",
    "physio rides Barbados",
    "pharmacy delivery Barbados",
    "QEH accessible taxi",
  ],
  openGraph: {
    title: "Access Barbados | Reliable Accessible Rides",
    description:
      "Reliable wheelchair-accessible rides across Barbados. Doctor visits, physio, pharmacy, supermarket. Call us, we'll be there.",
    type: "website",
    locale: "en_BB",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0c615f" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1820" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}

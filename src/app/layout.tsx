import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://blog.theinvisiblepanchos.com";

const siteDescription =
  "The official blog of The Invisible Panchos — underground Chicano hip-hop duo KILLcRey & Gene Flo. Boom bap beats, dispatches, and mission updates from San Diego // Sector 619.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Invisible Panchos | Official Blog",
    template: "%s | The Invisible Panchos",
  },
  description: siteDescription,
  keywords: [
    "The Invisible Panchos",
    "hip hop",
    "Chicano",
    "Chicano hip hop",
    "underground hip hop",
    "boom bap hip hop",
    "KILLcRey",
    "Gene Flo",
    "San Diego hip hop",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "The Invisible Panchos — Official Blog",
    type: "website",
    images: [{ url: "/panchosspacelogo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/panchosspacelogo.png"],
  },
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "The Invisible Panchos — Official Blog",
  url: siteUrl,
  description: siteDescription,
  inLanguage: "en",
  publisher: {
    "@type": "MusicGroup",
    name: "The Invisible Panchos",
    genre: ["Hip Hop", "Chicano Hip Hop", "Underground Hip Hop", "Boom Bap Hip Hop"],
    url: "https://theinvisiblepanchos.com",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${rajdhani.variable} h-full antialiased`}
    >
      <body className="bg-panchos min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

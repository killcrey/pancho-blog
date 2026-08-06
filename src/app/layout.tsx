import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://blog.theinvisiblepanchos.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Invisible Panchos | Mission Log",
    template: "%s | The Invisible Panchos",
  },
  description:
    "Dispatches, audio frequencies, and mission updates from The Invisible Panchos — KILLcRey & Gene Flo, San Diego // Sector 619.",
  openGraph: {
    siteName: "The Invisible Panchos — Mission Log",
    type: "website",
    images: [{ url: "/panchosspacelogo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/panchosspacelogo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${rajdhani.variable} h-full antialiased`}
    >
      <body className="bg-panchos min-h-full flex flex-col">{children}</body>
    </html>
  );
}

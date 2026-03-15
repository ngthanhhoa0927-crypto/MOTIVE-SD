import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Motive SD — Premium Headwear Store",
  description: "Discover premium caps, hats, and beanies at Motive SD. Quality headwear shipped directly from South Korea with styles for every occasion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

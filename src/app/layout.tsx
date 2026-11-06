import type { Metadata } from "next";
import { LocaleProvider } from "@/lib/locale";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aster — a calmer kind of cosmic clarity",
  description:
    "Explore Vedic astrology with thoughtful answers, clear evidence, and room to reflect.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}

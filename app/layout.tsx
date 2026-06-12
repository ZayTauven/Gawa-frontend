import type { Metadata } from "next";
import { Schibsted_Grotesk, Albert_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Direction « Craie vive » : Schibsted Grotesk (titres) + Albert Sans (corps).
const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});
const albert = Albert_Sans({
  variable: "--font-albert",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Gawa — Espace administration",
  description: "Tableau de bord Gawa pour les écoles : élèves, cours, examens et finances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${schibsted.variable} ${albert.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

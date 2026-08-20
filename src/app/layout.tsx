import type { Metadata } from "next";
import { Source_Serif_4, Source_Sans_3 } from "next/font/google";
import "./globals.css";

// Superfamille Source : le serif porte les titres et le texte long,
// le sans porte les libellés et les données. Les deux partagent les
// mêmes proportions, ce qui se voit — c'est une décision, pas un
// tirage. Voir docs/audit-ui-design.md § Typographie.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CardioInfo - Information en cardiologie interventionnelle",
  description:
    "Plateforme d'information pré-interventionnelle pour les patients de cardiologie interventionnelle. Comprenez votre geste, la préparation et les suites attendues.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${sourceSerif.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

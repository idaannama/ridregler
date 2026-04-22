import type { Metadata } from "next";
import { Dancing_Script } from "next/font/google";
import "./globals.css";

const dancing = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing" });

export const metadata: Metadata = {
  title: "tävlingsfasit delux",
  description: "Ställ frågor om Svenska Ridsportförbundets tävlingsreglemente",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={dancing.variable}>{children}</body>
    </html>
  );
}

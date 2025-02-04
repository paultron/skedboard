import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col font-sans font-bold justify-center overflow-x-auto bg-[#1b1b1b] text-[#bcbcbc]">{children}</body>
    </html>
  );
}

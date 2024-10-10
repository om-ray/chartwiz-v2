import React, { ReactNode } from "react";
import localFont from "next/font/local";

const geistSans = localFont({
  src: "../pages/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../pages/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

interface TextProps {
  children: ReactNode;
}

function Text({ children }: TextProps) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-mono)] flex justify-center m-2`}>
      {children}
    </div>
  );
}

export default Text;

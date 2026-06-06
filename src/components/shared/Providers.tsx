"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes"; // We can add this if needed, or just SessionProvider

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}

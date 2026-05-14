"use client";

import { ReactNode } from "react";
import { ConditionalClerkProvider } from "@/components/auth/ConditionalClerkProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { AuthInitializer } from "@/components/auth/AuthInitializer";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ConditionalClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <AuthInitializer />
        <Navbar />
        {children}
        <Footer />
      </ThemeProvider>
    </ConditionalClerkProvider>
  );
}

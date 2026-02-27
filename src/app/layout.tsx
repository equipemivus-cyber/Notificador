import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notificador Mivus",
  description: "Sistema de notificações para agendamentos",
};

import { AuthProviderWrapper } from "@/components/AuthProviderWrapper";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased flex h-screen overflow-hidden bg-zinc-950 font-sans">
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
      </body>
    </html>
  );
}

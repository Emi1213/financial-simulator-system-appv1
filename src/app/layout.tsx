import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { InstitutionProvider } from "@/features/institution/context/InstitutionProvider";
import { AuthProvider } from "@/features/auth/context/AuthProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Financial Simulator App",
  description: "Simulador financiero para créditos e inversiones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-theme="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Aplicar tema dark inmediatamente para evitar flash
              document.documentElement.classList.add('dark');
              document.documentElement.setAttribute('data-theme', 'dark');
            `,
          }}
        />
      </head>
      <body
        className={`${outfit.variable} font-sans antialiased bg-background text-foreground`}
      >
        <InstitutionProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </InstitutionProvider>
      </body>
    </html>
  );
}

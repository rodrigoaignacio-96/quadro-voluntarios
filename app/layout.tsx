import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default:  "Quadro de Voluntários",
    template: "%s — Quadro de Voluntários",
  },
  description: "Sistema de gestão de voluntários e escalas ministeriais.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  themeColor:   "#0a0a0f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>

        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3500,
            style: {
              background:   "#14141f",
              color:        "#e2e2e8",
              border:       "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              fontSize:     "13px",
              fontFamily:   "var(--font-body, sans-serif)",
              padding:      "10px 14px",
              boxShadow:    "0 8px 32px rgba(0,0,0,0.4)",
            },
            success: { iconTheme: { primary: "#eab308", secondary: "#0a0a0f" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#0a0a0f" } },
          }}
        />
      </body>
    </html>
  );
}

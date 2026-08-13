import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coach — AI Resume & Interview Agent",
  description: "Agentic resume tailoring and mock-interview coaching, powered by Gemini.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-ink font-body antialiased">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-line">
            <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
              <a href="/" className="font-display text-xl tracking-tight">
                Coach<span className="text-accent">.</span>
              </a>
              <nav className="flex gap-6 text-sm font-medium text-muted">
                <a href="/resume" className="hover:text-ink transition-colors">Resume Analysis</a>
                <a href="/interview" className="hover:text-ink transition-colors">Mock Interview</a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-line py-6 text-center text-xs text-muted">
            Agent output is a starting point, not ground truth — review before you use it.
          </footer>
        </div>
      </body>
    </html>
  );
}

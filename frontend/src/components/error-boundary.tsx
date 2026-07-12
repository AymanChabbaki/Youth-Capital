import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
}

// Branded crash screen — class component because error boundaries require lifecycle hooks.
// Deliberately avoids app hooks/providers (language, router) since those may be what crashed.
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-navy-dark relative overflow-hidden px-4">
        <div className="absolute inset-0 bg-grid-gold opacity-30 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-primary/25 blur-[130px] rounded-full" />
        <div className="absolute -bottom-40 -right-32 w-[420px] h-[420px] bg-gold/10 blur-[130px] rounded-full" />

        <div className="relative z-10 text-center flex flex-col items-center max-w-lg">
          <div className="w-20 h-20 rounded-3xl bg-gold/10 border border-gold/25 flex items-center justify-center mb-8">
            <AlertTriangle className="w-10 h-10 text-gold" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-white mb-4 text-balance">
            A Constitutional Crisis
          </h1>
          <p className="text-white/60 text-base sm:text-lg mb-10 leading-relaxed">
            Something broke inside the simulation engine. Our engineers have been notified — try reloading, or return to the Capital.
            <span className="block mt-2" dir="rtl">حدث خطأ داخل محرك المحاكاة. حاول إعادة التحميل أو العودة إلى الصفحة الرئيسية.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-2xl bg-gold text-navy-dark font-black text-lg shadow-2xl shadow-gold/25 hover:opacity-90 active:scale-95 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              Reload / إعادة التحميل
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl border-2 border-white/20 text-white font-bold hover:bg-white/10 active:scale-95 transition-all"
            >
              <Home className="w-5 h-5" />
              Home / الرئيسية
            </a>
          </div>
        </div>
      </div>
    );
  }
}

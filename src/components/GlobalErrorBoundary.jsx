import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[GlobalErrorBoundary] Caught unexpected UI exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    try {
      // Clear any potentially corrupted live cache entries
      localStorage.removeItem('fgc_spot_forex_rates');
      localStorage.removeItem('fgc_stocks_live_pk');
      localStorage.removeItem('fgc_stocks_live_us');
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#06111F] text-[#A8B3C2] flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-lg p-8 bg-[#0A1726] border border-white/10 rounded-3xl shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] mx-auto shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white tracking-tight">
                FGC Spot Terminal Recovery
              </h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                The terminal encountered an unexpected client state or network hiccup. Your session and settings are protected.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] font-mono text-slate-300 max-w-md mx-auto overflow-x-auto text-left">
                {String(this.state.error.message)}
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-[#00E676] hover:bg-emerald-400 text-[#06111F] rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00E676]/20 cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recover &amp; Reload Terminal</span>
              </button>

              <a
                href="/"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border border-white/10"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

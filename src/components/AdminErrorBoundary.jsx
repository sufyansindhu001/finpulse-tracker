import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AdminErrorBoundary] Caught render exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 rounded-3xl shadow-2xl text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {this.props.title || 'Tab Display Error'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              An unexpected error occurred while rendering this section. Your settings and articles remain safe.
            </p>
          </div>

          {this.state.error?.message && (
            <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-[11px] font-mono text-rose-700 dark:text-rose-300 max-w-lg mx-auto overflow-x-auto text-left">
              {String(this.state.error.message)}
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset &amp; Retry</span>
            </button>

            {this.props.onSwitchTab && (
              <button
                type="button"
                onClick={() => {
                  this.handleReset();
                  this.props.onSwitchTab('settings');
                }}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Settings</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

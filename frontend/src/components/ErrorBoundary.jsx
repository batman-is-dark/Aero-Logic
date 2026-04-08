import React from 'react';
import { AlertTriangle, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center font-sans">
          {/* Background */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-600/10 blur-[160px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600/5 blur-[140px] rounded-full" />
          </div>

          {/* Error Card */}
          <div className="relative z-10 max-w-2xl mx-auto px-8 text-center">
            <div className="bg-red-900/10 border border-red-900/30 p-8 rounded-2xl backdrop-blur-xl mb-8">
              <div className="flex justify-center mb-6">
                <div className="bg-red-500/20 p-4 rounded-xl">
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
              </div>

              <h1 className="text-3xl font-black text-red-400 mb-4 uppercase tracking-tight italic">
                Critical System Error
              </h1>

              <p className="text-slate-300 mb-6 leading-relaxed">
                An unexpected error occurred in the Tactical Command Deck. The system has been safely halted to prevent data corruption.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-6 text-left overflow-auto max-h-64">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Error Details:</p>
                  <p className="text-[11px] text-red-400 font-mono mb-3">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-[10px] text-slate-400">
                      <summary className="cursor-pointer font-bold mb-2">Stack Trace</summary>
                      <pre className="text-[9px] font-mono whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-cyan-500 text-slate-950 font-black rounded-lg hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
                >
                  <Home className="w-4 h-4" />
                  Return to Home
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-slate-800 text-slate-100 font-black rounded-lg hover:bg-slate-700 transition-colors uppercase tracking-wider text-sm border border-slate-700"
                >
                  Refresh Page
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-8">
              Error Reference: {new Date().toISOString()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

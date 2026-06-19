import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { errorLogger } from '../lib/error-logger';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const user = useAuthStore.getState().user;
    errorLogger.logError(error, {
      errorInfo,
      context: {
        route: window.location.pathname,
        role: user?.role || 'anonymous',
        tenantId: user?.tenantId || 'unknown',
      },
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900">Oops, something went wrong!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                An unexpected error occurred in the application. Please try reloading the page or contact support if the issue persists.
              </p>
            </div>

            {this.state.error && !import.meta.env.PROD && (
              <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 text-left max-h-40 overflow-y-auto font-mono text-xs text-red-700">
                <div className="font-bold border-b border-gray-200 pb-1 mb-1">
                  Error Details (Dev Only):
                </div>
                <div className="whitespace-pre-wrap">{this.state.error.message}</div>
                {this.state.error.stack && (
                  <div className="text-[10px] text-gray-400 mt-2 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all shadow-md shadow-primary-500/10 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <a
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all text-sm"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                Something Went Wrong
              </h1>
              <p className="text-gray-600">
                An unexpected error occurred in the admin dashboard.
              </p>
            </div>

            {this.props.fallback ? (
              this.props.fallback
            ) : (
              <>
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm">
                    <p className="font-semibold text-yellow-900 mb-2">
                      Development Info:
                    </p>
                    <p className="text-yellow-800 font-mono text-xs break-words">
                      {this.state.error?.message}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={this.resetError}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Try Again
                  </button>
                  <a
                    href="/dashboard"
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-center"
                  >
                    Go Home
                  </a>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Our team has been notified and will investigate.
                </p>
              </>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;

import React from 'react';
import logger from '../utils/logger';

/**
 * React Error Boundary - catches errors in child components
 * Logs errors and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error with component stack trace
    logger.error('React Component Error', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-red-900/20">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-md">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <details className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              <summary className="cursor-pointer font-semibold">Error Details</summary>
              <pre className="mt-2 overflow-auto text-gray-700 dark:text-gray-300">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <p>Please try refreshing the page or contact support if the issue persists.</p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-2 p-2 bg-red-50 rounded text-sm">
              {this.state.error?.toString()}
            </pre>
          )}
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
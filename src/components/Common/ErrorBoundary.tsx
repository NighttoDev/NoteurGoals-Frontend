import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: { componentStack: string }) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
  info?: { componentStack: string } | null;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, { componentStack: info.componentStack || "" });
    }
    // Always log to console in dev for visibility
    console.error("ErrorBoundary caught error:", error, info);
    this.setState({ info: { componentStack: info.componentStack || "" } });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{ padding: 12, color: "#b00020" }}>
          <strong>Something went wrong in this section.</strong>
        </div>
      );
    }
    return this.props.children;
  }
}

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { observability } from '@/services/observability';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught an error in component [${this.props.name || 'Unknown'}]:`, error, errorInfo);
    if (observability?.captureException) {
      observability.captureException(error, {
        extra: {
          componentName: this.props.name || 'Unknown',
          componentStack: errorInfo.componentStack,
        },
      });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/10 text-rose-900 dark:text-rose-100 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-wide">
              {this.props.name || 'Component'} Failure
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              An error occurred while loading this element. The rest of the workspace remains operational.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="h-8 px-3 rounded-lg text-xs font-bold gap-1.5 border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-900 dark:hover:text-rose-100"
          >
            <RefreshCcw className="h-3 w-3" />
            Reload Element
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ComponentErrorBoundary;

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="flex flex-col items-center justify-center gap-4 min-h-[30vh] p-8 text-center"
          data-ocid="error_state"
        >
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-lg text-foreground">
              Something went wrong
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm font-body">
              {this.state.error?.message ??
                "An unexpected error occurred. Please try again."}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={this.handleReset}
            data-ocid="error_state.retry_button"
          >
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

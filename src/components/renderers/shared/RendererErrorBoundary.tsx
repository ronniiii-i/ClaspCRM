"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "./ErrorState";

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  error: Error | null;
}

/** Keeps a renderer crash from taking down the whole workspace shell. */
export class RendererErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Module renderer failed", error, info);
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          title={this.props.title ?? "This module failed to render"}
          message={this.state.error.message}
          onRetry={this.reset}
        />
      );
    }

    return this.props.children;
  }
}

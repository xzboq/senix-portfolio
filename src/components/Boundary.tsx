"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  message: string;
  action: string;
}

/** Если демо упадёт (старый браузер, нет сети, баг), страница остаётся целой — падает только этот блок. */
export class Boundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("demo crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="result-box boundary" data-ok="false" role="alert">
        <span className="mono note">exit code 1</span>
        <strong>{this.props.message}</strong>
        <div>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            {this.props.action}
          </button>
        </div>
      </div>
    );
  }
}

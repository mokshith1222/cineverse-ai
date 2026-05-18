import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[App] Render boundary caught an error', { error, info });
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-950 px-4">
        <div className="max-w-md rounded-2xl border border-white/10 bg-gray-900/70 p-6 text-center shadow-2xl shadow-black/30">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-300" />
          <h1 className="text-xl font-black text-white">Something paused the experience</h1>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            CineVerse is still running. Refresh the view and the cached content will be used while live APIs recover.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-black text-gray-950 transition-colors hover:bg-cyan-400"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    );
  }
}

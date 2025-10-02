// components/AuthErrorBoundary.tsx
import { Component, ReactNode } from 'react';
import { useAuth } from '../context/authContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error('Auth error boundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h2>Authentication Error</h2>
          <p>There was a problem with your session. Please refresh the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
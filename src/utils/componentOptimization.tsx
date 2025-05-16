import React from 'react';
import { measureRender } from './performance';

type WithPerformanceTrackingProps<P> = {
  WrappedComponent: React.ComponentType<P>;
  componentName: string;
};

export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  const WithPerformanceTracking: React.FC<P> = (props) => {
    const endMeasure = measureRender(componentName);
    
    React.useEffect(() => {
      endMeasure();
    });

    return <WrappedComponent {...props} />;
  };

  WithPerformanceTracking.displayName = `WithPerformanceTracking(${componentName})`;
  return React.memo(WithPerformanceTracking);
}

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return React.useCallback(callback, deps);
}

export function useMemoizedValue<T>(
  value: T,
  deps: React.DependencyList
): T {
  return React.useMemo(() => value, deps);
}

type ErrorBoundaryProps<P> = {
  WrappedComponent: React.ComponentType<P>;
  fallback: React.ReactNode;
};

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback: React.ReactNode
): React.ComponentClass<P> {
  return class ErrorBoundary extends React.Component<P, { hasError: boolean }> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(): { hasError: boolean } {
      return { hasError: true };
    }

    render(): React.ReactNode {
      if (this.state.hasError) {
        return fallback;
      }

      return <WrappedComponent {...this.props} />;
    }
  };
} 
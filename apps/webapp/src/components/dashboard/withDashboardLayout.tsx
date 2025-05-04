import type { ComponentType } from 'react';
import { DashboardLayout } from './DashboardLayout';

export function withDashboardLayout<P extends object>(WrappedComponent: ComponentType<P>) {
  return function WithDashboardLayoutComponent(props: P) {
    return (
      <DashboardLayout>
        <WrappedComponent {...props} />
      </DashboardLayout>
    );
  };
}

'use client';

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

const DashboardComponent = dynamic(
  () => import('../../components/Dashboard/Dashboard').then((mod) => mod.Dashboard),
  {
    ssr: false,
  }
);

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardComponent />
    </ProtectedRoute>
  );
}

import { Suspense } from 'react';
import DashboardClient from './DashboardClient';

export default function HostPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-gray-400 text-sm tracking-widest">LOADING DASHBOARD...</div>
      </div>
    }>
      <DashboardClient params={params} />
    </Suspense>
  );
}
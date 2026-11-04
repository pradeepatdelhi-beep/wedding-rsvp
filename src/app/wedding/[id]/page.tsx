import { Suspense } from 'react';
import RSVPClient from './RSVPClient';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-gray-400 text-sm tracking-widest">LOADING...</div>
      </div>
    }>
      {/* Pass the params Promise directly. Do NOT await it here. */}
      <RSVPClient params={params} />
    </Suspense>
  );
}
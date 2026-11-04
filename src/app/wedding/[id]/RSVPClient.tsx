'use client';
import { useState, use } from 'react'; // Added 'use' to imports
import { supabase } from '@/lib/supabase';

export default function RSVPClient({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the promise safely inside the client component
  const { id } = use(params); 
  const weddingId = id;

  const [step, setStep] = useState(1);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [food, setFood] = useState<'veg' | 'non_veg'>('veg');
  const [loading, setLoading] = useState(false);

  const handleFinalSubmit = async () => {
    if (!weddingId) return;
    setLoading(true);
    
    const { error } = await supabase
      .from('guests')
      .insert({
        wedding_id: weddingId,
        name: 'Guest via Link', 
        attending: attending,
        guest_count: guestCount,
        food_preference: food,
        status: attending ? 'confirmed' : 'declined'
      });

    if (!error) {
      setStep(4);
    } else {
      console.error('Supabase error:', error);
      alert('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black flex flex-col items-center p-6">
      <div className="w-full max-w-md mt-12 text-center space-y-2">
        <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase font-bold">Wedding Guests · Concept</p>
        <h1 className="text-4xl font-extrabold tracking-tighter mt-4">A & R</h1>
        <p className="text-sm text-gray-500 font-medium">You're invited</p>
      </div>

      <div className="w-full max-w-md mt-10 bg-white border border-gray-100 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        {step === 1 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Will you attend?</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { setAttending(true); setStep(2); }} className="h-16 bg-black text-white rounded-2xl font-bold text-lg hover:scale-[0.98] transition-transform">YES</button>
              <button onClick={() => { setAttending(false); handleFinalSubmit(); }} className="h-16 bg-white border-2 border-gray-200 text-black rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors">NO</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10">
            <h2 className="text-2xl font-bold tracking-tight">Number of Guests</h2>
            <div className="flex items-center justify-between px-6">
              <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center text-3xl font-light hover:bg-gray-50">−</button>
              <span className="text-6xl font-bold tracking-tighter">{guestCount}</span>
              <button onClick={() => setGuestCount(guestCount + 1)} className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center text-3xl font-light hover:bg-gray-50">+</button>
            </div>
            <button onClick={() => setStep(3)} className="w-full h-16 bg-black text-white rounded-2xl font-bold text-lg mt-4 hover:scale-[0.98] transition-transform">Continue</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Food Preference</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setFood('veg')} className={`h-36 border-2 rounded-2xl flex flex-col items-center justify-center space-y-4 transition-all ${food === 'veg' ? 'border-black bg-gray-50' : 'border-gray-100'}`}>
                <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center"><div className="w-4 h-4 bg-black rounded-full"></div></div>
                <span className="font-bold text-xs tracking-widest">VEGETARIAN</span>
              </button>
              <button onClick={() => setFood('non_veg')} className={`h-36 border-2 rounded-2xl flex flex-col items-center justify-center space-y-4 transition-all ${food === 'non_veg' ? 'border-black bg-gray-50' : 'border-gray-100'}`}>
                <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center"><div className="w-4 h-4 bg-black rounded-full"></div></div>
                <span className="font-bold text-xs tracking-widest">NON-VEG</span>
              </button>
            </div>
            <button onClick={handleFinalSubmit} disabled={loading} className="w-full h-16 bg-black text-white rounded-2xl font-bold text-lg mt-4 hover:scale-[0.98] transition-transform disabled:opacity-50">
              {loading ? 'Confirming...' : 'Finalize RSVP'}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-4 py-12">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
            <h2 className="text-2xl font-bold tracking-tight pt-4">RSVP Confirmed</h2>
            <p className="text-gray-500 text-sm">Thank you. We can't wait to celebrate with you.</p>
          </div>
        )}
      </div>
      
      <p className="text-[10px] text-gray-300 mt-12 tracking-widest">POWERED BY SMART WEDDING</p>
    </div>
  );
}
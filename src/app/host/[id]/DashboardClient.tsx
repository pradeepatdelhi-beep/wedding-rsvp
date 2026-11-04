'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';

export default function DashboardClient({ params }: { params: Promise<{ id: string }> }) {
  // 1. Safely unwrap the params promise
  let id = '';
  try {
    const resolved = use(params);
    id = resolved?.id || '';
  } catch (e) {
    console.error("Failed to resolve params", e);
  }
  
  // 2. Define ALL state variables here at the top
  const [loading, setLoading] = useState(true);
  const [dbRowCount, setDbRowCount] = useState(-1);
  const [stats, setStats] = useState({
    totalInvited: 400,
    confirmed: 0,
    notAttending: 0,
    awaiting: 0,
    vegCount: 0,
    nonVegCount: 0
  });

  useEffect(() => {
    async function fetchData() {
      console.log("🔍 Dashboard is querying for wedding_id:", id);
      
      if (!id) {
        console.warn("No ID found, stopping fetch.");
        setLoading(false);
        return;
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timed out after 5s')), 5000);
      });

      const fetchPromise = supabase
        .from('guests')
        .select('*')
        .eq('wedding_id', id);

      try {
        const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
        const { data: guests, error } = result;

        console.log("📦 Guests found in database:", guests);
        if (error) throw error;

        // Record exactly how many rows the database returned
        setDbRowCount(guests ? guests.length : 0);

        if (guests && guests.length > 0) {
          const confirmed = guests.filter((g: any) => g.status === 'confirmed').length;
          const notAttending = guests.filter((g: any) => g.status === 'declined').length;
          const totalInvited = 400; 
          const awaiting = Math.max(0, totalInvited - confirmed - notAttending);

          const vegCount = guests
            .filter((g: any) => g.status === 'confirmed' && g.food_preference === 'veg')
            .reduce((sum: number, g: any) => sum + (g.guest_count || 1), 0);
            
          const nonVegCount = guests
            .filter((g: any) => g.status === 'confirmed' && g.food_preference === 'non_veg')
            .reduce((sum: number, g: any) => sum + (g.guest_count || 1), 0);

          setStats({ totalInvited, confirmed, notAttending, awaiting, vegCount, nonVegCount });
        }
      } catch (err: any) {
        console.error("Fetch failed or timed out:", err);
      } finally {
        // This guarantees the loading screen disappears no matter what
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-4">
        <div className="text-gray-400 text-sm tracking-widest animate-pulse">LOADING DASHBOARD...</div>
        <div className="text-xs text-red-400">Debug ID: {id || 'UNDEFINED'}</div>
      </div>
    );
  }

  const shareOnWhatsApp = () => {
    const link = `${window.location.origin}/wedding/${id}`;
    const message = `Hi! You're invited to A & R's Wedding! 🎉\n\nPlease tap the link below to RSVP and let us know if you're coming so we can finalize the food.\n\n${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const { totalInvited, confirmed, notAttending, awaiting, vegCount, nonVegCount } = stats;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black p-6 font-sans">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8 mt-4">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase font-bold">Wedding Dashboard</p>
            <h1 className="text-2xl font-extrabold tracking-tighter mt-1">A & R Wedding</h1>
          </div>
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
          <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase font-bold mb-2">Total Invited</p>
          <h2 className="text-6xl font-extrabold tracking-tighter">{totalInvited}</h2>
          <div className="w-full h-2 bg-gray-100 rounded-full mt-6 overflow-hidden flex">
            <div className="h-full bg-black" style={{ width: `${(confirmed/totalInvited)*100}%` }}></div>
            <div className="h-full bg-gray-400" style={{ width: `${(notAttending/totalInvited)*100}%` }}></div>
            <div className="h-full bg-gray-200" style={{ width: `${(awaiting/totalInvited)*100}%` }}></div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-black rounded-full"></div>
              <span className="font-bold text-xs tracking-widest">CONFIRMED</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">{confirmed}</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="font-bold text-xs tracking-widest">NOT ATTENDING</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">{notAttending}</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              <span className="font-bold text-xs tracking-widest">AWAITING RESPONSE</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">{awaiting}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
          <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase font-bold mb-4">Catering Order</p>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-2 border-black rounded-full flex items-center justify-center"><div className="w-3 h-3 bg-black rounded-full"></div></div>
              <span className="font-bold text-sm">VEG PLATES</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">{vegCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-2 border-black rounded-full flex items-center justify-center"><div className="w-3 h-3 bg-black rounded-full"></div></div>
              <span className="font-bold text-sm">NON-VEG PLATES</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">{nonVegCount}</span>
          </div>
        </div>

        <button 
          onClick={shareOnWhatsApp}
          className="w-full h-14 bg-[#25D366] text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
        >
          <span className="text-xl">💬</span>
          <span>Share Invite on WhatsApp</span>
        </button>

        {/* Debug text at the very bottom */}
        <p className="text-center text-xs text-blue-500 mt-8 font-mono">
          Raw DB Rows Returned: {dbRowCount}
        </p>
      </div>
    </div>
  );
}
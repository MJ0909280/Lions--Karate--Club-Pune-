import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BATCH_TIMINGS, BatchInfo } from '../types';
import { Calendar, Users, Target, Clock, Sparkles, Send, Laptop, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BatchesProps {
  onSelectBatch: (batchName: string) => void;
}

export default function Batches({ onSelectBatch }: BatchesProps) {
  const [batches, setBatches] = useState<BatchInfo[]>(BATCH_TIMINGS);
  const [activeTab, setActiveTab] = useState<'club' | 'online'>('club');

  // Custom scheduling interactive state for Online Mentor Tab
  const [prefDays, setPrefDays] = useState('3 Days a week');
  const [prefTime, setPrefTime] = useState('05:00 PM - 06:00 PM');
  const [studentAgeGroup, setStudentAgeGroup] = useState('Kids (Ages 4-7)');
  const [customMsg, setCustomMsg] = useState('');

  // Sync with Firestore dynamically
  useEffect(() => {
    const batchesRef = collection(db, 'batches');
    const unsubscribe = onSnapshot(batchesRef, (snapshot) => {
      if (!snapshot.empty) {
        const dbBatches: BatchInfo[] = [];
        snapshot.forEach((docSnap) => {
          dbBatches.push({
            id: docSnap.id,
            ...docSnap.data()
          } as BatchInfo);
        });
        setBatches(dbBatches);
      } else {
        // Fallback to static timings if DB collection is empty
        setBatches(BATCH_TIMINGS);
      }
    }, (error) => {
      console.error("Failed to load dynamic batches:", error);
      setBatches(BATCH_TIMINGS);
      handleFirestoreError(error, OperationType.GET, 'batches');
    });

    return () => unsubscribe();
  }, []);

  // Filter At-Club batches (exclude online mentor from standard cards)
  const clubBatches = batches.filter(
    (b) => b.id !== 'online-mentor' && !b.name.toLowerCase().includes('online')
  );

  const onlineBatch = batches.find(
    (b) => b.id === 'online-mentor' || b.name.toLowerCase().includes('online')
  ) || BATCH_TIMINGS.find(b => b.id === 'online-mentor');

  // Trigger custom drop text trigger on WhatsApp
  const handleDropTextWhatsApp = () => {
    const defaultText = `Hi Lions Karate Club Pune, I am interested in joining your Online Mentor program! Here are my preferred options:
- Selected Batch: ${studentAgeGroup}
- Preferred Days: ${prefDays}
- Preferred Time: ${prefTime}
${customMsg ? `- Additional Request: ${customMsg}` : ''}`;
    
    const encodedText = encodeURIComponent(defaultText);
    const whatsappUrl = `https://wa.me/919049688172?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="batches" className="py-14 sm:py-20 bg-zinc-950 border-t border-zinc-900/60 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 justify-center">
            <div className="h-[1px] w-8 bg-[#FF3B3F]"></div>
            <span className="text-[#FF3B3F] uppercase tracking-[0.3em] text-[10px] font-extrabold">TRAINING ATELIER</span>
            <div className="h-[1px] w-8 bg-[#FF3B3F]"></div>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-4">
            CHOOSE YOUR <span className="text-transparent" style={{ WebkitTextStroke: '1px #e5e5e5' }}>BATCH</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto">
            Traditional Shotokan discipline available both physically in our Dojo (6 days a week, starting from Age 4) and via customized Online Mentoring.
          </p>
        </div>

        {/* Dynamic Nav Tabs */}
        <div className="flex justify-center mb-10 sm:mb-14">
          <div className="inline-flex bg-slate-900 border border-zinc-850 p-1.5 rounded-xl shadow-inner shadow-black/80">
            <button
              onClick={() => setActiveTab('club')}
              className={`px-5 py-2.5 rounded-lg text-xs font-heading font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'club' 
                  ? 'bg-yellow-500 text-slate-950 shadow-lg font-black' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🥋 In-Club Batches (6 Days)
            </button>
            <button
              onClick={() => setActiveTab('online')}
              className={`px-5 py-2.5 rounded-lg text-xs font-heading font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'online' 
                  ? 'bg-yellow-500 text-slate-950 shadow-lg font-black' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              💻 Online Mentor Training
            </button>
          </div>
        </div>

        {/* Content Box with framer motion animations */}
        <AnimatePresence mode="wait">
          {activeTab === 'club' ? (
            <motion.div
              key="club-batches"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            >
              {clubBatches.map((b) => (
                <div 
                  key={b.id} 
                  className="group relative flex flex-col bg-slate-900/40 border border-zinc-900 overflow-hidden rounded-xl transition-all duration-300 hover:border-yellow-500/30 hover:-translate-y-1"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-zinc-800 group-hover:bg-gradient-to-r group-hover:from-yellow-500 group-hover:to-amber-500 transition-all duration-300" />
                  
                  <div className="p-5 flex flex-col flex-grow">
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850/30 uppercase tracking-widest block">
                        {b.ageGroup || "Ages 4+"}
                      </span>
                      <span className="text-[8px] font-sans font-bold text-[#FF3B3F] uppercase tracking-wider bg-[#FF3B3F]/10 px-1.5 py-0.5 rounded-full">
                        6 Days / Week
                      </span>
                    </div>

                    <h3 className="font-title text-base sm:text-lg font-black text-white group-hover:text-yellow-500 transition-colors uppercase leading-tight mb-3">
                      {b.name}
                    </h3>

                    {/* Detailed Schedule Items */}
                    <div className="bg-slate-950/70 border border-zinc-900/50 p-3.5 rounded-lg mb-4 space-y-2.5">
                      <div className="flex items-start space-x-2 text-zinc-400 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="uppercase text-[8px] text-zinc-500 tracking-wider block font-bold">Training Days</span>
                          <span className="font-semibold text-zinc-300">{b.days}</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 text-zinc-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="uppercase text-[8px] text-zinc-500 tracking-wider block font-bold">Standard Evening Hours (Choose slot)</span>
                          <div className="space-y-0.5 mt-0.5">
                            <span className="inline-block bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-300 font-bold px-1.5 py-0.5 rounded mr-1">5:00 - 6:00 PM</span>
                            <span className="inline-block bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-300 font-bold px-1.5 py-0.5 rounded mr-1">6:00 - 7:00 PM</span>
                            <span className="inline-block bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-300 font-bold px-1.5 py-0.5 rounded">7:00 - 8:00 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mentors */}
                    {b.coaches && (
                      <div className="flex items-center space-x-2 bg-yellow-500/5 border border-yellow-500/10 p-2.5 rounded-md mb-4 text-[10px] text-zinc-400">
                        <Users className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                        <div className="leading-tight">
                          <span className="uppercase text-[7px] tracking-wider text-zinc-500 block font-bold">SENSEIS</span>
                          <span className="font-medium text-zinc-300 block">{b.coaches}</span>
                        </div>
                      </div>
                    )}

                    {/* Focus Curriculum */}
                    <div className="text-xs text-zinc-500 leading-relaxed mb-6 mt-1 flex-grow">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Focus Curriculum</span>
                      <p className="italic text-zinc-400">"{b.focus || "Traditional training & competitive self defense drills."}"</p>
                    </div>

                    {/* Bottom Apply Trigger without pricing */}
                    <div className="pt-4 border-t border-zinc-850/60 flex items-center justify-end mt-auto">
                      <button
                        onClick={() => onSelectBatch(b.name)}
                        className="w-full sm:w-auto text-center font-heading font-extrabold text-[10px] uppercase tracking-wider border border-yellow-500/30 hover:border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-950 px-5 py-2.5 rounded transition-all cursor-pointer"
                      >
                        APPLY NOW
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="online-mentor"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900/40 border border-zinc-900 rounded-xl overflow-hidden p-6 sm:p-8 relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-500 to-amber-500" />
                
                {/* Visual Banner info */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <span className="inline-flex items-center space-x-1.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold font-mono tracking-widest px-2.5 py-1 rounded-full uppercase border border-yellow-500/20 mb-3">
                      <Laptop className="w-3 h-3" />
                      <span>Online Mentor Program</span>
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                      FLEXIBLE LIVE MENTORSHIP
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-3 leading-relaxed">
                      Can't make it to physical classes? Or looking for hyper-personalized schedule flexibility? Our <strong>Online Mentor Training</strong> connects you directly with expert Senseis for 1-on-1 virtual mentoring sessions structured around your calendar.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 text-zinc-300">
                      <ShieldCheck className="w-4 h-4 text-yellow-500 shrink-0 mt-1" />
                      <div className="text-xs">
                        <strong className="text-white">Custom Timings</strong>: Set up morning or evening sessions based entirely on your timezone and day choices.
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 text-zinc-300">
                      <ShieldCheck className="w-4 h-4 text-yellow-500 shrink-0 mt-1" />
                      <div className="text-xs">
                        <strong className="text-white">One-on-One Live Adjustments</strong>: Live real-time visual coaching with detailed posture & breathing adjustments.
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 text-zinc-300">
                      <ShieldCheck className="w-4 h-4 text-yellow-500 shrink-0 mt-1" />
                      <div className="text-xs">
                        <strong className="text-white">Official Belt Progression</strong>: Record kata demonstrations and undergo virtual exams qualified globally.
                      </div>
                    </div>
                  </div>

                  {onlineBatch && (
                    <div className="pt-4 border-t border-zinc-850/80 flex items-center justify-end">
                      <button
                        onClick={() => onSelectBatch(onlineBatch.name)}
                        className="w-full sm:w-auto text-center font-heading font-extrabold text-[11px] uppercase tracking-wider bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-5 py-3 rounded shadow-md transition-all cursor-pointer"
                      >
                        REGISTER ONLINE PROGRAM
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Interactive Scheduler Widget */}
                <div className="lg:col-span-5 bg-slate-950/70 border border-zinc-850/60 p-5 rounded-lg flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-yellow-500 mb-1">
                      <Sparkles className="w-4 h-4" />
                      <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-[#FF3B3F]">CUSTOMIZE SCHEDULE</h4>
                    </div>

                    {/* Pre-fill Age Group */}
                    <div>
                      <label className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">1. Student Bracket</label>
                      <select 
                        value={studentAgeGroup} 
                        onChange={(e) => setStudentAgeGroup(e.target.value)}
                        className="w-full bg-slate-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-yellow-500"
                      >
                        <option value="Kids (Ages 4-7)">Kids (Ages 4-7)</option>
                        <option value="Youth (Ages 8-14)">Youth (Ages 8-14)</option>
                        <option value="Teens & Adults (15+)">Teens & Adults (15+)</option>
                      </select>
                    </div>

                    {/* Pre-fill Prefer Days */}
                    <div>
                      <label className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">2. Preferred Days</label>
                      <select 
                        value={prefDays} 
                        onChange={(e) => setPrefDays(e.target.value)}
                        className="w-full bg-slate-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-yellow-500"
                      >
                        <option value="3 Days a week">3 Days a week</option>
                        <option value="Weekends Only">Weekends Only</option>
                        <option value="Daily (Monday - Saturday)">Daily (6 Days a week)</option>
                        <option value="Flexible Customized Days">Flexible / Customized Days</option>
                      </select>
                    </div>

                    {/* Pre-fill Prefer Time */}
                    <div>
                      <label className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">3. Preferred Class Time</label>
                      <select 
                        value={prefTime} 
                        onChange={(e) => setPrefTime(e.target.value)}
                        className="w-full bg-slate-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-yellow-500"
                      >
                        <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                        <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                        <option value="07:00 PM - 08:00 PM">07:00 PM - 08:00 PM</option>
                        <option value="Morning Flexible Slot">Morning Flexible Slot</option>
                        <option value="Other / Custom Slot">Other / Custom Slot</option>
                      </select>
                    </div>

                    {/* Custom Request Text */}
                    <div>
                      <label className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">4. Custom notes</label>
                      <textarea
                        value={customMsg}
                        onChange={(e) => setCustomMsg(e.target.value)}
                        placeholder="e.g. Please set up alternate weekends, or I need 1-on-1 private training... "
                        className="w-full bg-slate-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-yellow-500 h-16 resize-none placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={handleDropTextWhatsApp}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-extrabold text-[10px] tracking-wider uppercase py-3 rounded flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/10"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>DROP TEXT & CHOOSE TIME</span>
                    </button>
                    <p className="text-[10px] text-zinc-500 text-center mt-2 font-mono">
                      Opens direct chat on WhatsApp at 9049688172
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}

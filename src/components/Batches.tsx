import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BATCH_TIMINGS, BatchInfo, Admission, BELT_LEVELS, DOJO_BRANCHES } from '../types';
import { Calendar, Users, Target, Clock, Sparkles, Send, Laptop, ShieldCheck, Check, Heart, Smile, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import IDCard from './IDCard';

interface BatchesProps {
  onSelectBatch: (batchName: string) => void;
}

const classesData = {
  tigers: {
    id: 'little-tigers',
    emoji: '🧒',
    title: 'Little Tigers',
    ages: 'Ages 4 to 7',
    tagline: 'Toddlers & young children – character building',
    times: ['5:00 - 6:00 PM', '6:00 - 7:00 PM', '7:00 - 8:00 PM'],
    benefits: [
      { icon: '🌟', text: 'Focus & Concentration (listening more to parents)' },
      { icon: '🤸', text: 'Balanced Body (posture & hand-eye coordination)' },
      { icon: '🤝', text: 'Respectful Manners (learning polite greetings)' }
    ],
    mentors: 'Sensei Maruti Jadhav · Sensei Shivraj Jejure',
    safety: '100% safe with double‑layer soft mats & caring masters.'
  },
  warriors: {
    id: 'young-warriors5-14',
    emoji: '👦',
    title: 'Young Warriors',
    ages: 'Ages 8 to 14',
    tagline: 'Active kids – protection skills, confidence, fitness',
    times: ['5:00 - 6:00 PM', '6:00 - 7:00 PM', '7:00 - 8:00 PM'],
    benefits: [
      { icon: '🛡️', text: 'Anti‑Bully Protection (safe boundaries & voice commands)' },
      { icon: '💪', text: 'Ultimate Self‑Confidence (brave for school & exams)' },
      { icon: '🏃', text: 'Cardio & Active Strength (healthy active sweat)' }
    ],
    mentors: 'Sensei Maruti Jadhav · Sensei Shivraj Jejure',
    safety: 'Timings that fit school & homework slots perfectly.'
  },
  elite: {
    id: 'elite-dojo-15-plus',
    emoji: '🧑',
    title: 'Elite Dojo',
    ages: 'Ages 15+ & Adults',
    tagline: 'Defense skills, high‑momentum fitness, stress relief',
    times: ['5:00 - 6:00 PM', '6:00 - 7:00 PM', '7:00 - 8:00 PM'],
    benefits: [
      { icon: '🥋', text: 'Real Martial Arts (traditional Shotokan forms & defence)' },
      { icon: '⚡', text: 'Power & Reaction Speed (high-impact cardio drills)' },
      { icon: '🧘', text: 'Mind Reset & Stress Relief (crisp physical training)' }
    ],
    mentors: 'Sensei Maruti Jadhav · Sensei Shivraj Jejure',
    safety: 'World‑certified belt opportunities & flexible attendance.'
  }
};

export default function Batches({ onSelectBatch }: BatchesProps) {
  const [batches, setBatches] = useState<BatchInfo[]>(BATCH_TIMINGS);
  const [activeTab, setActiveTab] = useState<'club' | 'online'>('club');

  // Custom scheduling interactive state for Online Mentor Tab
  const [prefDays, setPrefDays] = useState('3 Days a week');
  const [prefTime, setPrefTime] = useState('05:00 PM - 06:00 PM');
  const [studentAgeGroup, setStudentAgeGroup] = useState('Kids (Ages 4-7)');
  const [customMsg, setCustomMsg] = useState('');

  // Interactive quick age filter selected by Parent for In-Club tab
  const [ageFilter, setAgeFilter] = useState<'all' | 'kids' | 'youth' | 'teens-adults'>('all');

  // Selected convenient class timing for each batch card
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({
    'little-tigers': '5:00 - 6:00 PM',
    'young-warriors5-14': '5:00 - 6:00 PM',
    'elite-dojo-15-plus': '6:00 - 7:00 PM'
  });

  // --- NEW INTEGRATED PREMIER DOJO CARD STATE ---
  const [soundOn, setSoundOn] = useState(true);
  const [innerActiveAge, setInnerActiveAge] = useState<'tigers' | 'warriors' | 'elite'>('tigers');
  const [cardSelectedTime, setCardSelectedTime] = useState<string | null>(null);
  
  // Custom quick form values
  const [childName, setChildName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  const [latestAdmission, setLatestAdmission] = useState<Admission | null>(null);
  
  // [GITHUB UPDATE] Added new state fields to support persistent branch selection, coach, starting belt level, fees status, DOB, and terms acceptance in the Club Batches tab
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [selectedBranchId, setSelectedBranchId] = useState(DOJO_BRANCHES[0].id);
  const [feesStatus, setFeesStatus] = useState<'Paid' | 'Unpaid'>('Unpaid');
  const [beltLevel, setBeltLevel] = useState(BELT_LEVELS[0].name);
  
  // Celebration UI states
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationName, setCelebrationName] = useState('');
  const [celebrationDocId, setCelebrationDocId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [particles, setParticles] = useState<{ id: number; char: string; left: number; duration: number; delay: number; size: number }[]>([]);

  // Sound Synthesizer Chime
  const playMelodicChime = () => {
    if (!soundOn) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      const notes = [784, 1046.5, 1318.5]; // G5, C6, E6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.35);
      });
    } catch (e) {
      console.warn("Audio chime prevented/unsupported", e);
    }
  };

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

  // Helper to generate dynamic Sequenced Student IDs
  const generateStudentId = async (): Promise<string> => {
    const currentYear = new Date().getFullYear();
    try {
      const admissionsRef = collection(db, 'admissions');
      const q = query(admissionsRef, where('createdAt', '>=', new Date(`${currentYear}-01-01`).getTime()));
      const snap = await getDocs(q);
      const count = snap.size + 100;
      const paddedSerial = String(count).padStart(3, '0');
      return `LKCP-${currentYear}-${paddedSerial}`;
    } catch {
      const randomId = Math.floor(100 + Math.random() * 900);
      return `LKCP-${currentYear}-${randomId}`;
    }
  };

  // Quick form Firestore submission
  const handleQuickRegisterSubmit = async (e: any) => {
    if (e) e.preventDefault();
    if (!childName.trim() || !cardSelectedTime) return;

    setSubmitting(true);
    try {
      const studentId = await generateStudentId();
      const currentTimestamp = Date.now();
      const data = classesData[innerActiveAge];

      // Calculate safe simulated date of birth based on age bracket fallback or user input
      const fallbackAge = innerActiveAge === 'tigers' ? 6 : innerActiveAge === 'warriors' ? 10 : 20;
      const ageNum = age !== '' ? Number(age) : fallbackAge;
      const finalDob = dob || new Date(currentTimestamp - ageNum * 365.25 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // Standard robust Karate Silhouette Base64 placeholder matching high visual standards
      const PLACEHOLDER_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23111'><rect width='100' height='100' fill='%231a1a1a'/><circle cx='50' cy='35' r='14' fill='%23c9a96e'/><path d='M50 50 L35 75 L30 73 L42 53 L38 50 L30 55 L28 50 L40 42 Z' fill='%23fff'/><path d='M50 50 L65 80 L72 82 L58 55 L65 48 L75 52 L78 47 L60 40 Z' fill='%23fff'/><path d='M42 45 H58 V49 H42 Z' fill='%239B1B20'/></svg>";

      // Look up Dojo branches to assign matching Coach
      const branchObj = DOJO_BRANCHES.find(b => b.id === selectedBranchId) || DOJO_BRANCHES[0];

      // [GITHUB UPDATE] Mapped new rich form fields dynamically so that they are saved inside Firestore correctly and visible on the admin panel.
      const admissionPayload = {
        fullName: childName.trim(),
        dob: finalDob,
        age: ageNum,
        gender: 'male', // default fallback
        parentName: parentName.trim() || 'Parent / Legal Guardian',
        phone: phone.trim() || 'Not Provided',
        whatsApp: phone.trim() || 'Not Provided',
        email: email.trim() || 'quick-entry@lionskarateclub.com',
        address: `${branchObj.name} Dojo`,
        batch: `${data.title} (${cardSelectedTime})`,
        beltLevel,
        photoUrl: photoBase64 || PLACEHOLDER_AVATAR,
        studentId,
        status: 'pending',
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
        branch: branchObj.name,
        coachName: branchObj.coach,
        feesStatus
      };

      // Add direct to admissions database
      const docRef = await addDoc(collection(db, 'admissions'), admissionPayload);
      setCelebrationDocId(docRef.id);
      setCelebrationName(childName.trim());
      setLatestAdmission({
        id: docRef.id,
        ...admissionPayload
      } as Admission);

      // Play melodic synthesized chime
      playMelodicChime();

      // Spawn falling emoji particles stream
      const rainPool = ['🥋', '⭐', '🏆', '⭐', '🥋', '🏆', '✨', '🔴', '⚪', '🟡'];
      const generatedParticles = Array.from({ length: 35 }).map((_, i) => ({
        id: i,
        char: rainPool[Math.floor(Math.random() * rainPool.length)],
        left: Math.random() * 95,
        duration: 3 + Math.random() * 3, // 3 to 6 sec
        delay: Math.random() * 2,
        size: 16 + Math.floor(Math.random() * 16)
      }));
      setParticles(generatedParticles);

      // Trigger standard visual pop-up overlays
      setShowCelebration(true);

    } catch (err: any) {
      console.error("Firestore quick registration error:", err);
      handleFirestoreError(err, OperationType.CREATE, 'admissions');
    } finally {
      setSubmitting(false);
    }
  };

  // Sync state dynamic loaders
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
        setBatches(BATCH_TIMINGS);
      }
    }, (error) => {
      console.error("Failed to load dynamic batches:", error);
      setBatches(BATCH_TIMINGS);
      handleFirestoreError(error, OperationType.GET, 'batches');
    });

    return () => unsubscribe();
  }, []);

  const onlineBatch = batches.find(
    (b) => b.id === 'online-mentor' || b.name.toLowerCase().includes('online')
  ) || BATCH_TIMINGS.find(b => b.id === 'online-mentor');

  return (
    <section id="batches" className="py-14 sm:py-20 bg-zinc-950 border-t border-zinc-900/60 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 justify-center">
            <div className="h-[1px] w-8 bg-yellow-500"></div>
            <span className="text-yellow-500 uppercase tracking-[0.3em] text-[10px] font-extrabold">TRAINING ATELIER</span>
            <div className="h-[1px] w-8 bg-yellow-500"></div>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-4">
            CHOOSE YOUR <span className="text-transparent font-kanji" style={{ WebkitTextStroke: '1px #C9A96E', color: 'transparent' }}>BATCH</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Simple training times, high safety, and flexible hours designed with parents' daily busy lives in mind. Starting from Age 4 up to mature adults.
          </p>
        </div>

        {/* Dynamic Nav Tabs */}
        <div className="flex justify-center mb-6">
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


        {/* Dynamic Age Group Filter for Parents (Interactive Finder) */}
        {activeTab === 'club' && (
          <div className="text-center mb-10 max-w-3xl mx-auto">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest font-mono block mb-3">
              🧒 SELECT YOUR CHILD'S AGE GROUP TO AUTO-FIND THE PERFECT CLASS:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/40 p-2 rounded-xl border border-zinc-900">
              <button
                onClick={() => {
                  setAgeFilter('all');
                  setInnerActiveAge('tigers');
                  playMelodicChime();
                }}
                className={`py-2 px-3 text-xs rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                  ageFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-slate-950/40'
                }`}
              >
                🌍 Show All Batches
              </button>
              <button
                onClick={() => {
                  setAgeFilter('kids');
                  setInnerActiveAge('tigers');
                  playMelodicChime();
                }}
                className={`py-2 px-3 text-xs rounded-lg font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  ageFilter === 'kids'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-slate-950/40'
                }`}
              >
                <span>🧒</span>
                <span>Ages 4 to 7</span>
              </button>
              <button
                onClick={() => {
                  setAgeFilter('youth');
                  setInnerActiveAge('warriors');
                  playMelodicChime();
                }}
                className={`py-2 px-3 text-xs rounded-lg font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  ageFilter === 'youth'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-slate-950/40'
                }`}
              >
                <span>👦</span>
                <span>Ages 8 to 14</span>
              </button>
              <button
                onClick={() => {
                  setAgeFilter('teens-adults');
                  setInnerActiveAge('elite');
                  playMelodicChime();
                }}
                className={`py-2 px-3 text-xs rounded-lg font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  ageFilter === 'teens-adults'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-slate-950/40'
                }`}
              >
                <span>🧑</span>
                <span>Ages 15+ & Adults</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Box with framer motion animations */}
        <AnimatePresence mode="wait">
          {activeTab === 'club' ? (
            <motion.div
              key="club-batches-interactive"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[480px] mx-auto px-1"
            >
              <style>{`
                @keyframes fall {
                  0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
                  80% { opacity: 1; }
                  100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
                }
                .bubble-ring {
                  box-shadow: 0 4px 20px rgba(198, 40, 40, 0.4);
                }
              `}</style>

              {/* Sound Toggle controls row */}
              <div className="flex justify-end gap-2 mb-3 pr-1">
                <button 
                  onClick={() => {
                    setSoundOn(!soundOn);
                    if (!soundOn) {
                      // small synthesizer tap
                      try {
                        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                        if (AudioContext) {
                          const ctx = new AudioContext();
                          const osc = ctx.createOscillator();
                          const gn = ctx.createGain();
                          osc.frequency.setValueAtTime(600, ctx.currentTime);
                          gn.gain.setValueAtTime(0.08, ctx.currentTime);
                          gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                          osc.connect(gn).connect(ctx.destination);
                          osc.start();
                          osc.stop(ctx.currentTime + 0.1);
                        }
                      } catch(e) {}
                    }
                  }} 
                  className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 text-[#F0E6D3] flex items-center justify-center hover:bg-stone-800 transition active:scale-95 cursor-pointer text-xs"
                  aria-label="Toggle Sound Effects"
                >
                  {soundOn ? <Volume2 className="w-4 h-4 text-amber-500 animate-[pulse_2s_infinite]" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
                </button>
              </div>

              {/* Real Interactive Dojo Card */}
              <div className="bg-[#141211] rounded-[18px] overflow-hidden border border-stone-800/80 shadow-[0_15px_45px_rgba(0,0,0,0.7)]">
                {/* Gold/Red belted linear header stripe */}
                <div className="h-2 bg-gradient-to-r from-amber-500 via-red-600 to-amber-500" />
                
                <div className="p-6 sm:p-8">
                  {/* Category Header */}
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-2 select-none animate-[bounce_3s_infinite]">{classesData[innerActiveAge].emoji}</div>
                    <h3 className="font-heading text-3xl font-black text-white uppercase tracking-tight">
                      {classesData[innerActiveAge].title}
                    </h3>
                    <div className="text-amber-500 font-bold text-sm tracking-wide font-mono mt-1">
                      {classesData[innerActiveAge].ages}
                    </div>
                  </div>

                  <div className="text-center font-sans italic text-stone-400 text-xs sm:text-[13px] mb-6 leading-relaxed">
                    "{classesData[innerActiveAge].tagline}"
                  </div>

                  {/* Dynamic step dot progression ring */}
                  <div className="flex justify-center items-center gap-3.5 mb-7">
                    {/* Ring 1 - Age selected */}
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-500 shadow-[0_0_10px_rgba(212,175,55,0.7)] transition-all duration-300" title="Step 1: Category Selected" />
                    
                    {/* Line 1 */}
                    <div className={`flex-1 h-0.5 rounded transition-all duration-300 ${cardSelectedTime ? 'bg-amber-500' : 'bg-stone-800'}`} />
                    
                    {/* Ring 2 - Time slot selected */}
                    <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 border ${
                      cardSelectedTime 
                        ? 'bg-amber-500 border-amber-550 shadow-[0_0_10px_rgba(212,175,55,0.7)]' 
                        : 'bg-stone-900 border-stone-800'
                    }`} title="Step 2: Timings selected" />
                    
                    {/* Line 2 */}
                    <div className={`flex-1 h-0.5 rounded transition-all duration-300 ${cardSelectedTime && childName.trim().length > 0 ? 'bg-amber-500' : 'bg-stone-800'}`} />
                    
                    {/* Ring 3 - Form Filled */}
                    <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 border ${
                      cardSelectedTime && childName.trim().length > 0 
                        ? 'bg-amber-500 border-amber-550 shadow-[0_0_10px_rgba(212,175,55,0.7)]' 
                        : 'bg-stone-900 border-stone-800'
                    }`} title="Step 3: Registration completed" />
                  </div>

                  {/* Choose class timings section */}
                  <div className="text-center font-bold text-white text-xs sm:text-sm mb-3 font-mono tracking-wide uppercase flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>⏰ Choose Daily Class Time:</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {classesData[innerActiveAge].times.map((slot) => {
                      const isSelected = cardSelectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            setCardSelectedTime(slot);
                            // small play sound trigger
                            try {
                              const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                              if (AudioContext && soundOn) {
                                const ctx = new AudioContext();
                                const osc = ctx.createOscillator();
                                const gn = ctx.createGain();
                                osc.frequency.setValueAtTime(880, ctx.currentTime);
                                gn.gain.setValueAtTime(0.08, ctx.currentTime);
                                gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                                osc.connect(gn).connect(ctx.destination);
                                osc.start();
                                osc.stop(ctx.currentTime + 0.15);
                              }
                            } catch(e){}
                          }}
                          className={`py-2.5 px-1 rounded-full text-[10px] font-bold text-center transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? 'bg-[#9B1B20] text-white shadow-[0_0_12px_rgba(155,27,32,0.6)] border border-[#9B1B20]'
                              : 'bg-stone-900/60 border border-stone-800/80 text-stone-400 hover:text-stone-100 hover:bg-stone-800'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>

                  {/* Everyday benefits summary */}
                  <ul className="space-y-2 mb-4 bg-[#1c1917]/30 p-4 rounded-xl border border-stone-900/40">
                    {classesData[innerActiveAge].benefits.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-stone-300 text-xs font-sans leading-relaxed">
                        <span className="text-[#9B1B20] font-bold text-lg select-none leading-none -mt-0.5">{b.icon}</span>
                        <span>{b.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Mentor showcase */}
                  <div className="text-center text-[11px] text-stone-400 mb-3 bg-stone-950 py-2.5 px-3 rounded-lg border border-stone-900">
                    👥 <strong>Mentors:</strong> {classesData[innerActiveAge].mentors}
                  </div>

                  {/* Safe dojo assurance */}
                  <div className="bg-[#1e2a1e]/30 border-l-4 border-[#4caf50] p-3 rounded-r-lg font-sans text-[11.5px] text-[#b0a68e] flex items-center gap-2 mb-6">
                    <span className="text-[#4caf50] text-[15px]">🛡️</span>
                    <span>{classesData[innerActiveAge].safety}</span>
                  </div>

                  {/* Integrated fast form */}
                  <form onSubmit={handleQuickRegisterSubmit} className="pt-5 border-t border-stone-900 space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wide">
                        Child's Full Name <span className="text-[#9B1B20]">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="Enter child's full name" 
                        required
                        className="w-full bg-[#1c1917]/50 border border-stone-800 rounded-lg px-3 py-2.5 text-stone-100 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wide">
                        Parent/Guardian Name
                      </label>
                      <input 
                        type="text" 
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="Enter parent/guardian name" 
                        className="w-full bg-[#1c1917]/50 border border-stone-800 rounded-lg px-3 py-2.5 text-stone-100 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wide">
                        Phone Number <span className="text-[#9B1B20]">*</span>
                      </label>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter mobile for reminders" 
                        required
                        className="w-full bg-[#1c1917]/50 border border-stone-800 rounded-lg px-3 py-2.5 text-stone-100 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wide">
                        Email Address (Optional)
                      </label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com" 
                        className="w-full bg-[#1c1917]/50 border border-stone-800 rounded-lg px-3 py-2.5 text-stone-100 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans outline-none"
                      />
                    </div>

                    {/* Date of Birth & Automated Age calculation */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wide">
                          Date of Birth <span className="text-[#9B1B20]">*</span>
                        </label>
                        <input 
                          type="date" 
                          value={dob}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDob(val);
                            if (!val) {
                              setAge('');
                              return;
                            }
                            const birthDate = new Date(val);
                            const today = new Date();
                            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                            const m = today.getMonth() - birthDate.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                              calculatedAge--;
                            }
                            setAge(calculatedAge >= 0 ? calculatedAge : 0);
                          }}
                          required
                          className="w-full bg-[#1c1917]/50 border border-stone-800 rounded-lg px-3 py-2.5 text-stone-100 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wide">
                          Calculated Age
                        </label>
                        <input 
                          type="text" 
                          value={age !== '' ? `${age} Years Old` : 'Select DOB'}
                          disabled
                          className="w-full bg-[#1c1917]/20 border border-stone-850/80 rounded-lg px-3 py-2.5 text-stone-400 text-xs font-sans outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Dojo Branch & Dedicated Coach Display */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wide">
                        Dojo Karate Branch <span className="text-[#9B1B20]">*</span>
                      </label>
                      <select 
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        required
                        className="w-full bg-[#1c1917]/50 border border-stone-800 rounded-lg px-3 py-2.5 text-stone-100 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans outline-none"
                      >
                        {DOJO_BRANCHES.map((b) => (
                          <option key={b.id} value={b.id} className="bg-stone-900 text-stone-100">
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-amber-500 pl-1 font-mono">
                        👤 Dedicated Instructor: {DOJO_BRANCHES.find(b => b.id === selectedBranchId)?.coach || 'Maruti Sir'}
                      </p>
                    </div>

                    {/* Belt Selection & Fees Status */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wide">
                          Starting Belt <span className="text-[#9B1B20]">*</span>
                        </label>
                        <select 
                          value={beltLevel}
                          onChange={(e) => setBeltLevel(e.target.value)}
                          required
                          className="w-full bg-[#1c1917]/50 border border-stone-800 rounded-lg px-3 py-2.5 text-stone-100 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans outline-none"
                        >
                          {BELT_LEVELS.map((belt) => (
                            <option key={belt.name} value={belt.name} className="bg-stone-900 text-stone-100">
                              {belt.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wide">
                          Fees Status <span className="text-[#9B1B20]">*</span>
                        </label>
                        <select 
                          value={feesStatus}
                          onChange={(e) => setFeesStatus(e.target.value as 'Paid' | 'Unpaid')}
                          required
                          className="w-full bg-[#1c1917]/50 border border-stone-800 rounded-lg px-3 py-2.5 text-stone-100 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans outline-none"
                        >
                          <option value="Unpaid" className="bg-stone-900 text-stone-100">Unpaid</option>
                          <option value="Paid" className="bg-stone-900 text-stone-100">Paid</option>
                        </select>
                      </div>
                    </div>

                    {/* Parent/Guardian Declaration section */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wide">
                        5. Parent/Guardian Declaration <span className="text-[#9B1B20]">*</span>
                      </label>
                      <div className="bg-[#141211]/80 border border-stone-850 rounded-xl p-4 space-y-3">
                        <div className="text-stone-400 text-[11px] leading-relaxed max-h-32 overflow-y-auto pr-2 space-y-2 font-sans select-none">
                          <p className="font-semibold text-amber-500 uppercase tracking-wider text-[9px]">LIONS KARATE CLUB PUNE — Parent/Guardian Declaration</p>
                          <p>
                            I hereby declare that the information provided in this form is true and accurate to the best of my knowledge.
                          </p>
                          <p>
                            I voluntarily enroll myself/my child in the training programs conducted by LIONS KARATE CLUB PUNE and understand that martial arts training involves physical activity and inherent risks.
                          </p>
                          <p>
                            I confirm that I/my child is medically fit to participate in training activities. Any medical condition, injury, or health concern has been disclosed to the club.
                          </p>
                          <p>
                            I consent to the use of photographs, videos, and personal details for student identification, certificates, competitions, club records, website content, and promotional activities.
                          </p>
                          <p>
                            I agree to abide by all rules, regulations, safety guidelines, and fee policies of LIONS KARATE CLUB PUNE.
                          </p>
                        </div>
                        
                        <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-stone-850 select-none">
                          <input 
                            type="checkbox" 
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            required
                            className="w-4 h-4 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500 mt-0.5 accent-amber-500"
                          />
                          <span className="text-stone-300 text-[11px] leading-tight font-medium">
                            I accept the Parent/Guardian Declaration and agree to abide by all club policies. <span className="text-[#9B1B20]">*</span>
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Integrated custom student photo uploader */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wide">
                        Upload Student Photo (For ID Card Generation)
                      </label>
                      <div className="flex items-center space-x-3 bg-[#1c1917]/50 border border-stone-800 rounded-lg p-3 transition-all">
                        {photoBase64 ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-amber-500/50 shrink-0">
                            <img src={photoBase64} alt="Uploaded student" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoBase64(null);
                                setPhotoName('');
                              }}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-red-500 font-bold hover:bg-black/85"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 select-none font-bold text-lg shrink-0">
                            📷
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            id="quick-card-photo-picker"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setPhotoName(file.name);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setPhotoBase64(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="quick-card-photo-picker"
                            className="inline-block bg-stone-900 hover:bg-stone-850 border border-stone-800 px-3 py-1.5 rounded text-[11px] font-bold text-amber-500 cursor-pointer text-center"
                          >
                            {photoName ? '📸 Change Photo' : '📂 Choose Photo'}
                          </label>
                          <p className="text-[10px] text-stone-500 mt-1 truncate max-w-[200px]">
                            {photoName || "Using dynamic silhouette if empty"}
                          </p>
                        </div>
                      </div>
                    </div>

                     {/* Interactive Register submission */}
                    <button 
                      type="submit"
                      disabled={submitting || !childName.trim() || !cardSelectedTime || !phone.trim() || !dob || !termsAccepted}
                      className={`w-full py-3.5 px-4 font-heading font-black text-white text-base tracking-widest rounded-full uppercase transition-all duration-200 cursor-pointer ${
                        childName.trim() && cardSelectedTime && phone.trim() && dob && termsAccepted
                          ? 'bg-[#9B1B20] hover:bg-red-650 hover:scale-[1.01] shadow-[0_5px_0_#7f1d1d] active:translate-y-1 active:shadow-[0_2px_0_#7f1d1d]'
                          : 'bg-stone-800 border border-stone-700 text-stone-500 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      {submitting ? 'Registering with Dojo...' : 'REGISTER'}
                    </button>
                  </form>
                </div>
              </div>
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

        {/* --- CUSTOM REAL-TIME CELEBRATION MODAL OVERLAY --- */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm overflow-hidden select-none">
            {/* Falling Particle rain stream */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {particles.map((p) => (
                <div
                  key={p.id}
                  className="absolute text-center pointer-events-none"
                  style={{
                    left: `${p.left}%`,
                    top: `-80px`,
                    fontSize: `${p.size}px`,
                    animation: `fall ${p.duration}s linear ${p.delay}s infinite`,
                  }}
                >
                  {p.char}
                </div>
              ))}
            </div>

            {/* High-Fidelity Student Admission Card Box */}
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#141211] border-2 border-amber-500/50 p-5 sm:p-7 rounded-2xl shadow-[0_15px_60px_rgba(0,0,0,0.85)] text-center text-[#F0E6D2] z-10 animate-[bounce_0.2s_ease-out]">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-900">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <span className="text-xl">🥋</span>
                  <h4 className="font-heading text-sm sm:text-base font-black uppercase tracking-wider text-white">
                    Official Admission Confirmed
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCelebration(false);
                    setChildName('');
                    setParentName('');
                    setPhone('');
                    setEmail('');
                    setPhotoBase64(null);
                    setPhotoName('');
                    setLatestAdmission(null);
                  }}
                  className="text-zinc-500 hover:text-white transition-colors text-xs font-bold px-2 py-1 bg-stone-950 border border-stone-850 rounded hover:border-zinc-700 cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Massive beautiful heart-touching messages specifically for parents & students */}
              <div className="space-y-4 mb-6">
                <div className="bg-[#1e1a18]/90 border-2 border-amber-600/80 p-5 rounded-2xl text-left relative shadow-lg">
                  <div className="absolute -top-3.5 left-6 bg-amber-500 text-slate-950 font-sans font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-white">
                    Our Solemn Promise
                  </div>
                  <p className="text-amber-100 text-xs sm:text-base italic font-sans leading-relaxed pt-2">
                    "We hope that <strong className="text-amber-400 font-extrabold">{celebrationName}</strong> becomes a true fighter — physically powerful, mentally unbreakable, deeply disciplined, and polite to everybody in daily life."
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left text-[11px] leading-relaxed">
                  <div className="bg-stone-900/80 border border-stone-850 p-3 rounded-xl col-span-1 sm:col-span-2">
                    <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest block mb-0.5">🥋 Courage & Grit</span>
                    <p className="text-stone-300">
                      "A black belt is a white belt who never gave up. We are incredibly honored to walk beside <strong>{celebrationName}</strong> on this beautiful journey of respect, physical courage, and lifelong core strength."
                    </p>
                  </div>
                  <div className="bg-stone-900/80 border border-stone-850 p-3 rounded-xl">
                    <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest block mb-0.5">🌱 Character & Focus</span>
                    <p className="text-stone-300">
                      "Karate builds outstanding focus and character. We promise to guide them with absolute care, helping them become highly self-disciplined and friendly to all."
                    </p>
                  </div>
                  <div className="bg-stone-900/80 border border-stone-850 p-3 rounded-xl">
                    <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest block mb-0.5">🤝 Parent Partnership</span>
                    <p className="text-stone-300">
                      "To see your child stand tall and face life's obstacles with brave confidence is the soul of karate. We are deeply grateful for your trust in our dojo."
                    </p>
                  </div>
                </div>
              </div>

              {latestAdmission && (
                <div className="bg-slate-950/60 p-1 rounded-xl mb-6 border border-stone-950 shadow-inner overflow-hidden flex justify-center">
                  <IDCard admission={latestAdmission} showSuccessBanner={false} hideDownloadActions={true} />
                </div>
              )}

              {/* Footer Selection button to clear and return to Dojo */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCelebration(false);
                    setChildName('');
                    setParentName('');
                    setPhone('');
                    setEmail('');
                    setPhotoBase64(null);
                    setPhotoName('');
                    setLatestAdmission(null);
                  }}
                  className="w-full bg-[#9B1B20] hover:bg-rose-700 text-white font-heading font-black py-3 px-6 rounded-full text-xs transition uppercase tracking-widest cursor-pointer shadow-lg active:scale-95"
                >
                  RETURN TO MAIN DOJO
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import html2pdf from 'html2pdf.js';
import confetti from 'canvas-confetti';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Admission, BELT_LEVELS, DOJO_BRANCHES } from '../types';
import AttendanceTracker from './AttendanceTracker';
import { 
  Search, 
  Award, 
  Calendar, 
  ClipboardList, 
  User, 
  ChevronRight, 
  CheckCircle, 
  FileCheck, 
  ShieldCheck, 
  CreditCard,
  AlertCircle,
  PlusCircle,
  MapPin,
  Clock,
  ArrowRight,
  RefreshCw,
  MessageCircle,
  TrendingUp,
  GraduationCap,
  Printer,
  X,
  CheckSquare,
  Bell,
  Info,
  Download,
  Trophy,
  Flame,
  Star,
  Sparkles
} from 'lucide-react';

const playKarateBell = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Explicitly resume audio context to handle browser-specific autoplay restrictions
    if (ctx.state === 'suspended') {
      ctx.resume().catch(e => console.warn('AudioContext resume failed:', e));
    }
    
    const now = ctx.currentTime;

    const fundamental = 330; // pitch frequency (E4 resonant tone)
    
    // Main chime oscillator
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(fundamental, now);
    osc1.type = 'sine';
    
    // Harmonic metallic third overtone ring
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(fundamental * 1.20, now);
    osc2.type = 'sine';

    // Harmonic octave bell chime ring
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.frequency.setValueAtTime(fundamental * 2.0, now);
    osc3.type = 'sine';

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.45, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc1.connect(gain1);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    gain1.connect(masterGain);

    osc2.connect(gain2);
    gain2.gain.setValueAtTime(0.25, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    gain2.connect(masterGain);

    osc3.connect(gain3);
    gain3.gain.setValueAtTime(0.15, now);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    gain3.connect(masterGain);

    masterGain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + 1.5);
    osc2.stop(now + 1.0);
    osc3.stop(now + 0.6);
  } catch (err) {
    console.warn("Audio Context playback couldn't initialize on user gesture:", err);
  }
};

const getRequiredClassesForCurrentBelt = (beltLevel: string): { required: number; nextBelt: string } => {
  const currentClean = (beltLevel || '').toLowerCase();
  
  if (currentClean.includes('white') || currentClean.includes('10th kyu')) {
    return { required: 15, nextBelt: 'Yellow Belt (9th & 8th Kyu)' };
  }
  if (currentClean.includes('yellow') || currentClean.includes('9th') || currentClean.includes('8th')) {
    return { required: 20, nextBelt: 'Orange Belt (7th Kyu)' };
  }
  if (currentClean.includes('orange') || currentClean.includes('7th')) {
    return { required: 25, nextBelt: 'Green Belt (6th Kyu)' };
  }
  if (currentClean.includes('green') || currentClean.includes('6th')) {
    return { required: 30, nextBelt: 'Blue Belt (5th Kyu)' };
  }
  if (currentClean.includes('blue') || currentClean.includes('5th')) {
    return { required: 35, nextBelt: 'Purple Belt (4th Kyu)' };
  }
  if (currentClean.includes('purple') || currentClean.includes('4th')) {
    return { required: 40, nextBelt: 'Brown Belt (3rd to 1st Kyu)' };
  }
  if (currentClean.includes('brown') || currentClean.includes('3rd') || currentClean.includes('1st')) {
    return { required: 45, nextBelt: 'Black Belt (1st Dan +)' };
  }
  return { required: 50, nextBelt: 'Higher Dan Grade' };
};

interface ExamRecord {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  branch: string;
  coachName: string;
  currentBelt: string;
  targetBelt: string;
  status: 'pending' | 'approved' | 'passed' | 'failed';
  feesStatus: 'Paid' | 'Pending';
  examScheduleId?: string;
  examDate?: string;
  venueDetails?: string;
  grade?: string;
  remarks?: string;
  createdAt: number;
}

interface BadgeDef {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  description: string;
  progressText: string;
  isUnlocked: boolean;
}

function KarateBeltGraphic({ beltName }: { beltName: string }) {
  const nameClean = beltName.toLowerCase();
  
  let mainColor = '#f8fafc';
  let shadingColor = '#cbd5e1';
  let isBlack = false;

  if (nameClean.includes('white')) {
    mainColor = '#f8fafc';
    shadingColor = '#cbd5e1';
  } else if (nameClean.includes('yellow')) {
    mainColor = '#facc15';
    shadingColor = '#d97706';
  } else if (nameClean.includes('orange')) {
    mainColor = '#f97316';
    shadingColor = '#c2410c';
  } else if (nameClean.includes('green')) {
    mainColor = '#10b981';
    shadingColor = '#047857';
  } else if (nameClean.includes('blue')) {
    mainColor = '#3b82f6';
    shadingColor = '#1d4ed8';
  } else if (nameClean.includes('purple')) {
    mainColor = '#a855f7';
    shadingColor = '#6d28d9';
  } else if (nameClean.includes('brown')) {
    mainColor = '#92400e';
    shadingColor = '#451a03';
  } else if (nameClean.includes('black')) {
    mainColor = '#18181b';
    shadingColor = '#09090b';
    isBlack = true;
  }

  return (
    <div className="w-full flex justify-center py-1 select-none">
      <svg viewBox="0 0 140 80" className="w-[90px] h-auto drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] filter">
        {/* Left Loop */}
        <path 
          d="M 40 36 C 20 36, 8 30, 8 20 C 8 10, 22 10, 38 18" 
          fill="none" 
          stroke={mainColor} 
          strokeWidth="11" 
          strokeLinecap="round" 
        />
        {/* Stitching on Left Loop */}
        <path 
          d="M 40 36 C 20 36, 8 30, 8 20 C 8 10, 22 10, 38 18" 
          fill="none" 
          stroke={isBlack ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)'} 
          strokeWidth="9" 
          strokeLinecap="round" 
          strokeDasharray="2,2" 
        />

        {/* Right Loop */}
        <path 
          d="M 100 36 C 120 36, 132 30, 132 20 C 132 10, 118 10, 102 18" 
          fill="none" 
          stroke={mainColor} 
          strokeWidth="11" 
          strokeLinecap="round" 
        />
        {/* Stitching on Right Loop */}
        <path 
          d="M 100 36 C 120 36, 132 30, 132 20 C 132 10, 118 10, 102 18" 
          fill="none" 
          stroke={isBlack ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)'} 
          strokeWidth="9" 
          strokeLinecap="round" 
          strokeDasharray="2,2" 
        />

        {/* Left Tail - angled down and left */}
        <path 
          d="M 58 42 C 46 51, 34 64, 38 72" 
          fill="none" 
          stroke={mainColor} 
          strokeWidth="11.5" 
          strokeLinecap="round" 
        />
        {/* Stitching on Left Tail */}
        <path 
          d="M 58 42 C 46 51, 34 64, 38 72" 
          fill="none" 
          stroke={isBlack ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)'} 
          strokeWidth="9.5" 
          strokeLinecap="round" 
          strokeDasharray="3,1.5" 
        />

        {/* Right Tail - angled down and right */}
        <path 
          d="M 82 42 C 94 51, 106 64, 102 72" 
          fill="none" 
          stroke={mainColor} 
          strokeWidth="11.5" 
          strokeLinecap="round" 
        />
        {/* Stitching on Right Tail */}
        <path 
          d="M 82 42 C 94 51, 106 64, 102 72" 
          fill="none" 
          stroke={isBlack ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)'} 
          strokeWidth="9.5" 
          strokeLinecap="round" 
          strokeDasharray="3,1.5" 
        />

        {/* Left Back Knot backing */}
        <rect x="56" y="27" width="28" height="15" rx="3" fill={shadingColor} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

        {/* Center Knot loops / overlapping fold */}
        <path 
          d="M 54 29 C 54 29, 70 24, 86 32 C 86 32, 84 44, 70 42 C 56 40, 54 29, 54 29 Z" 
          fill={mainColor} 
          stroke="rgba(0,0,0,0.2)" 
          strokeWidth="1" 
        />
        <path 
          d="M 54 29 C 54 29, 70 24, 86 32 C 86 32, 84 44, 70 42 C 56 40, 54 29, 54 29 Z" 
          fill="none" 
          stroke={isBlack ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.15)'} 
          strokeWidth="1" 
          strokeDasharray="1.5,1.5" 
        />

        {/* Wrapping overlay fold */}
        <path 
          d="M 62 25 C 74 27, 81 35, 78 44 C 74 48, 62 44, 62 35 Z" 
          fill={shadingColor} 
          stroke="rgba(0,0,0,0.25)" 
          strokeWidth="0.75" 
        />

        {/* Embroidery Details */}
        {isBlack ? (
          <>
            {/* Dan bar rank embroidery (gold/orange stripes) */}
            <path d="M 37 66 Q 38 69 39 71" stroke="#fbbf24" strokeWidth="8.5" strokeLinecap="butt" />
          </>
        ) : (
          <>
            {/* Small brand label on tip */}
            <rect x="36" y="66" width="5.5" height="4.5" rx="0.5" fill="#ffffff" stroke="rgba(0,0,0,0.3)" strokeWidth="0.3" transform="rotate(-15 37 67)" />
          </>
        )}
      </svg>
    </div>
  );
}

function StudentPortalSkeleton() {
  return (
    <div className="space-y-8 animate-pulse text-left">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/20 border border-zinc-900 p-5 rounded-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-zinc-850" />
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-24 h-4 bg-zinc-800 rounded" />
              <div className="h-1 w-1 rounded-full bg-zinc-700" />
              <div className="w-32 h-3 bg-zinc-900 rounded" />
            </div>
            <div className="w-48 h-6 bg-zinc-800 rounded" />
            <div className="w-36 h-3 bg-zinc-900 rounded" />
          </div>
        </div>
        <div className="w-32 h-10 bg-zinc-900 rounded-lg" />
      </div>

      {/* Progress & Belt graphics placeholder */}
      <div className="bg-slate-900/20 border border-zinc-900 p-6 sm:p-8 rounded-2xl text-center space-y-6">
        <div className="w-32 h-16 bg-zinc-850 rounded-xl mx-auto" />
        <div className="space-y-2 max-w-sm mx-auto">
          <div className="w-32 h-4 bg-zinc-800 rounded mx-auto" />
          <div className="w-48 h-3 bg-zinc-900 rounded mx-auto" />
        </div>
        <div className="max-w-xl mx-auto space-y-2">
          <div className="flex justify-between text-xs text-zinc-500">
            <div className="w-20 h-3 bg-zinc-900 rounded" />
            <div className="w-16 h-3 bg-zinc-900 rounded" />
          </div>
          <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden">
            <div className="w-3/5 h-full bg-zinc-800 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4 border-t border-zinc-900/40">
          <div className="bg-slate-950/40 p-4 rounded-xl border border-zinc-900/30 space-y-2">
            <div className="w-16 h-3 bg-zinc-900 rounded mx-auto" />
            <div className="w-24 h-4 bg-zinc-800 rounded mx-auto" />
          </div>
          <div className="bg-slate-950/40 p-4 rounded-xl border border-zinc-900/30 space-y-2">
            <div className="w-16 h-3 bg-zinc-900 rounded mx-auto" />
            <div className="w-24 h-4 bg-zinc-800 rounded mx-auto" />
          </div>
          <div className="bg-slate-950/40 p-4 rounded-xl border border-zinc-900/30 space-y-2">
            <div className="w-16 h-3 bg-zinc-900 rounded mx-auto" />
            <div className="w-24 h-4 bg-zinc-800 rounded mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceSkeleton() {
  return (
    <div className="bg-slate-900/10 border border-zinc-900/50 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse text-left">
      <div className="space-y-3 flex-grow w-full">
        <div className="w-36 h-4 bg-zinc-850 rounded" />
        <div className="w-56 h-5 bg-zinc-805 rounded" />
        <div className="w-full h-3 bg-zinc-900 rounded mt-2" />
      </div>
      <div className="w-28 h-9 bg-zinc-850 rounded-lg shrink-0 w-full md:w-auto" />
    </div>
  );
}

function ExamsHistoricalSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-slate-900/10 border border-zinc-900 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2 flex-grow w-full">
          <div className="flex items-center space-x-2">
            <div className="w-24 h-4.5 bg-zinc-850 rounded" />
            <div className="w-20 h-3 bg-zinc-900 rounded" />
          </div>
          <div className="h-16 bg-slate-950/30 rounded-xl border border-zinc-900/30 w-full" />
        </div>
        <div className="w-24 h-8 bg-zinc-850 rounded-lg shrink-0" />
      </div>
      <div className="bg-slate-900/10 border border-zinc-900 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2 flex-grow w-full">
          <div className="flex items-center space-x-2">
            <div className="w-24 h-4.5 bg-zinc-850 rounded" />
            <div className="w-20 h-3 bg-zinc-900 rounded" />
          </div>
          <div className="h-16 bg-slate-950/30 rounded-xl border border-zinc-900/30 w-full" />
        </div>
        <div className="w-24 h-8 bg-zinc-850 rounded-lg shrink-0" />
      </div>
    </div>
  );
}

interface StudentPortalProps {
  initialTab?: 'progress' | 'exam' | 'attendance';
  onNavigate?: (view: 'home' | 'admission' | 'student-portal' | 'admin') => void;
}

export default function StudentPortal({ initialTab = 'progress', onNavigate }: StudentPortalProps) {
  const [activeTab, setActiveTabState] = useState<'progress' | 'exam' | 'attendance'>(initialTab);

  useEffect(() => {
    setActiveTabState(initialTab);
  }, [initialTab]);

  const [studentIdInput, setStudentIdInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [activeStudent, setActiveStudent] = useState<Admission | null>(null);
  const [searchError, setSearchError] = useState('');
  
  // Exams related states
  const [registeredExams, setRegisteredExams] = useState<ExamRecord[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [selectedCert, setSelectedCert] = useState<ExamRecord | null>(null);
  const [downloadingCert, setDownloadingCert] = useState(false);

  // Dynamic automated badge calculations with zero overhead
  const getStudentBadges = (): BadgeDef[] => {
    if (!activeStudent) return [];
    
    const hasPassedExam = registeredExams.some(e => e.status === 'passed');
    const hasHighScore = registeredExams.some(e => 
      e.status === 'passed' && 
      e.grade && 
      ['A', 'A+', 'Outstanding', 'Distinction', 'Excellent', 'A GRADE', 'OUTSTANDING'].includes(e.grade.trim().toUpperCase())
    );
    const isPastWhite = activeStudent.beltLevel.toLowerCase() !== 'white belt' && 
                        !activeStudent.beltLevel.toLowerCase().includes('white');

    return [
      {
        id: 'first-step',
        name: 'First Step',
        icon: Sparkles,
        color: 'text-sky-400',
        borderColor: 'border-sky-500/20',
        bgColor: 'bg-sky-500/10',
        textColor: 'text-sky-300',
        description: 'Attended your first offline karate training session. Welcome to the Dojo!',
        progressText: attendanceCount >= 1 ? 'Unlocked!' : '0 / 1 Class',
        isUnlocked: attendanceCount >= 1
      },
      {
        id: 'loyal-lion',
        name: 'Dedicated Lion',
        icon: Flame,
        color: 'text-amber-500',
        borderColor: 'border-amber-500/20',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-300',
        description: 'Completed 15 classes of high-intensity training. True consistency!',
        progressText: `${Math.min(attendanceCount, 15)} / 15 Classes`,
        isUnlocked: attendanceCount >= 15
      },
      {
        id: 'perfect-attendance',
        name: 'Perfect Attendance',
        icon: Clock,
        color: 'text-emerald-400',
        borderColor: 'border-emerald-500/20',
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-300',
        description: 'Completed 30 or more training sessions. Unstoppable dedication!',
        progressText: `${Math.min(attendanceCount, 30)} / 30 Classes`,
        isUnlocked: attendanceCount >= 30
      },
      {
        id: 'resilient-warrior',
        name: 'Resilient Warrior',
        icon: ShieldCheck,
        color: 'text-indigo-400',
        borderColor: 'border-indigo-500/20',
        bgColor: 'bg-indigo-500/10',
        textColor: 'text-indigo-300',
        description: 'Successfully promoted past White Belt rank. No longer a beginner!',
        progressText: isPastWhite ? 'Unlocked!' : 'Reach Yellow Belt+',
        isUnlocked: isPastWhite
      },
      {
        id: 'first-promo',
        name: 'First Promotion',
        icon: GraduationCap,
        color: 'text-purple-400',
        borderColor: 'border-purple-500/20',
        bgColor: 'bg-purple-500/10',
        textColor: 'text-purple-300',
        description: 'Challenged the senseis and successfully passed your first promotion exam!',
        progressText: hasPassedExam ? 'Unlocked!' : '0 / 1 Passed Exam',
        isUnlocked: hasPassedExam
      },
      {
        id: 'kata-master',
        name: 'Kata Master',
        icon: Star,
        color: 'text-yellow-400',
        borderColor: 'border-yellow-500/20',
        bgColor: 'bg-yellow-500/10',
        textColor: 'text-yellow-300',
        description: "Achieved an 'A' grade or Outstanding performance on a belt grading test.",
        progressText: hasHighScore ? 'Unlocked!' : 'Grade A in any Exam',
        isUnlocked: hasHighScore
      }
    ];
  };

  const parseColorValues = (str: string): number[] => {
    const matches = str.match(/[-+]?[0-9]*\.?[0-9]+%?/g);
    if (!matches) return [0, 0, 0, 1];
    return matches.map(m => {
      if (m.endsWith('%')) {
        return parseFloat(m) / 100;
      }
      return parseFloat(m);
    });
  };

  const oklchToHsl = (l: number, c: number, h: number, a: number = 1): string => {
    const hue = h;
    const lightness = Math.min(100, Math.max(0, l * 100));
    const saturation = Math.min(100, Math.max(0, (c / 0.4) * 100));
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${a})`;
  };

  const oklabToHsl = (l: number, a: number, b: number, alpha: number = 1): string => {
    const c = Math.sqrt(a * a + b * b);
    let h = Math.atan2(b, a) * (180 / Math.PI);
    if (h < 0) h += 360;
    return oklchToHsl(l, c, h, alpha);
  };

  const convertUnsupportedColors = (colorStr: string): string => {
    if (typeof colorStr !== 'string') return colorStr;
    let result = colorStr;
    const oklchRegex = /oklch\([^)]+\)/gi;
    result = result.replace(oklchRegex, (match) => {
      const vals = parseColorValues(match);
      const l = vals[0] !== undefined ? vals[0] : 0;
      const c = vals[1] !== undefined ? vals[1] : 0;
      const h = vals[2] !== undefined ? vals[2] : 0;
      const a = vals[3] !== undefined ? vals[3] : 1;
      return oklchToHsl(l, c, h, a);
    });
    
    const oklabRegex = /oklab\([^)]+\)/gi;
    result = result.replace(oklabRegex, (match) => {
      const vals = parseColorValues(match);
      const l = vals[0] !== undefined ? vals[0] : 0;
      const aVal = vals[1] !== undefined ? vals[1] : 0;
      const bVal = vals[2] !== undefined ? vals[2] : 0;
      const alpha = vals[3] !== undefined ? vals[3] : 1;
      return oklabToHsl(l, aVal, bVal, alpha);
    });
    
    return result;
  };

  const sanitizeUnsupportedColors = (css: string): string => {
    return convertUnsupportedColors(css);
  };

  const handleDownloadCertificatePDF = async () => {
    if (!selectedCert) return;
    setDownloadingCert(true);
    
    const originalStyles = new Map<HTMLElement, string>();
    const tempStyles: HTMLStyleElement[] = [];
    
    const originalGetComputedStyle = window.getComputedStyle;
    const originalGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;
    const cssRulesDescriptor = Object.getOwnPropertyDescriptor(CSSStyleSheet.prototype, 'cssRules');
    
    try {
      const element = document.getElementById('printable-certificate-el');
      if (!element) {
        console.error("Printable certificate element not found");
        return;
      }

      window.getComputedStyle = function (elt, pseudoElt) {
        const style = originalGetComputedStyle(elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            if (prop === 'getPropertyValue') {
              return function (propertyName: string) {
                const val = target.getPropertyValue(propertyName);
                if (typeof val === 'string' && (val.toLowerCase().includes('oklch') || val.toLowerCase().includes('oklab'))) {
                  return convertUnsupportedColors(val);
                }
                return val;
              };
            }
            
            const value = Reflect.get(target, prop);
            if (typeof value === 'function') {
              return value.bind(target);
            }
            if (typeof value === 'string' && (value.toLowerCase().includes('oklch') || value.toLowerCase().includes('oklab'))) {
              return convertUnsupportedColors(value);
            }
            return value;
          }
        });
      };

      CSSStyleDeclaration.prototype.getPropertyValue = function (property: string) {
        const value = originalGetPropertyValue.call(this, property);
        if (typeof value === 'string' && (value.toLowerCase().includes('oklch') || value.toLowerCase().includes('oklab'))) {
          return convertUnsupportedColors(value);
        }
        return value;
      };

      if (cssRulesDescriptor && cssRulesDescriptor.get) {
        const originalCssRulesGet = cssRulesDescriptor.get;
        Object.defineProperty(CSSStyleSheet.prototype, 'cssRules', {
          get() {
            const rules = originalCssRulesGet.call(this);
            if (!rules) return rules;
            return new Proxy(rules, {
              get(target, prop) {
                if (prop === 'length') return target.length;
                if (prop === 'item') {
                  return function (index: number) {
                    return this[index];
                  };
                }
                
                const val = Reflect.get(target, prop);
                if (typeof val === 'object' && val !== null && 'style' in val) {
                  return new Proxy(val, {
                    get(ruleTarget, ruleProp) {
                      if (ruleProp === 'style') {
                        const style = ruleTarget.style;
                        return new Proxy(style, {
                          get(styleTarget, styleProp) {
                            if (styleProp === 'getPropertyValue') {
                              return function (propertyName: string) {
                                const v = styleTarget.getPropertyValue(propertyName);
                                if (typeof v === 'string' && (v.toLowerCase().includes('oklch') || v.toLowerCase().includes('oklab'))) {
                                  return convertUnsupportedColors(v);
                                }
                                return v;
                              };
                            }
                            const v = Reflect.get(styleTarget, styleProp);
                            if (typeof v === 'function') return v.bind(styleTarget);
                            if (typeof v === 'string' && (v.toLowerCase().includes('oklch') || v.toLowerCase().includes('oklab'))) {
                              return convertUnsupportedColors(v);
                            }
                            return v;
                          }
                        });
                      }
                      return Reflect.get(ruleTarget, ruleProp);
                    }
                  });
                }
                return val;
              }
            });
          },
          configurable: true
        });
      }

      const styleElements = Array.from(document.querySelectorAll('style'));
      styleElements.forEach((styleEl) => {
        const cssText = styleEl.textContent || '';
        if (cssText.toLowerCase().includes('oklch') || cssText.toLowerCase().includes('oklab')) {
          originalStyles.set(styleEl, cssText);
          styleEl.textContent = sanitizeUnsupportedColors(cssText);
        }
      });

      const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
      for (const linkEl of linkElements) {
        try {
          const url = linkEl.href;
          if (url && (url.startsWith(window.location.origin) || !url.startsWith('http'))) {
            const response = await fetch(url);
            if (response.ok) {
              const cssText = await response.text();
              if (cssText.toLowerCase().includes('oklch') || cssText.toLowerCase().includes('oklab')) {
                linkEl.disabled = true;
                originalStyles.set(linkEl, 'disabled');
                
                const tempStyle = document.createElement('style');
                tempStyle.textContent = sanitizeUnsupportedColors(cssText);
                document.head.appendChild(tempStyle);
                tempStyles.push(tempStyle);
              }
            }
          }
        } catch (linkErr) {
          console.warn("Could not process stylesheet link:", linkEl.href, linkErr);
        }
      }

      const opt = {
        margin:       10,
        filename:     `LKC_Certificate_${selectedCert.studentName.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2.5, useCORS: true, logging: false, letterRendering: true },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'landscape' as const }
      };

      const clonedElement = element.cloneNode(true) as HTMLElement;
      clonedElement.style.display = 'block';
      clonedElement.style.background = '#fffbeb';
      clonedElement.style.color = '#0c0a09';
      clonedElement.style.margin = '0 auto';
      clonedElement.style.padding = '35px';
      clonedElement.style.maxWidth = '1000px';
      
      const allClonedElements = [clonedElement, ...Array.from(clonedElement.querySelectorAll('*'))] as HTMLElement[];
      allClonedElements.forEach((el) => {
        if (el.style) {
          for (let i = 0; i < el.style.length; i++) {
            const propName = el.style[i];
            const val = el.style.getPropertyValue(propName);
            if (val && (val.toLowerCase().includes('oklch') || val.toLowerCase().includes('oklab'))) {
              el.style.setProperty(propName, convertUnsupportedColors(val));
            }
          }
        }
      });
      
      await html2pdf().set(opt).from(clonedElement).save();
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
      CSSStyleDeclaration.prototype.getPropertyValue = originalGetPropertyValue;
      if (cssRulesDescriptor) {
        Object.defineProperty(CSSStyleSheet.prototype, 'cssRules', cssRulesDescriptor);
      }

      originalStyles.forEach((originalVal, el) => {
        if (el instanceof HTMLLinkElement) {
          el.disabled = false;
        } else if (el instanceof HTMLStyleElement) {
          el.textContent = originalVal;
        }
      });
      
      tempStyles.forEach(styleEl => {
        if (styleEl.parentNode) {
          styleEl.parentNode.removeChild(styleEl);
        }
      });
      
      setDownloadingCert(false);
    }
  };

  // Scheduled Exams states
  const [examSchedules, setExamSchedules] = useState<any[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');

  // New Exam Form states
  const [targetBelt, setTargetBelt] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [branch, setBranch] = useState('');
  const [coachName, setCoachName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [feesStatus, setFeesStatus] = useState<'Paid' | 'Pending'>('Pending');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ studentName: string; targetBelt: string } | null>(null);
  const [formError, setFormError] = useState('');

  // New School Student registration states (No pre-existing ID)
  const [examMode, setExamMode] = useState<'verify' | 'new'>('verify');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCurrentBelt, setNewStudentCurrentBelt] = useState(BELT_LEVELS[0].name);

  // Automated Progress Status & Alert states
  const [attendanceCount, setAttendanceCount] = useState<number>(0);
  const [attendanceLoading, setAttendanceLoading] = useState<boolean>(false);
  const [hasShownAlert, setHasShownAlert] = useState<boolean>(false);

  // Real-time listener for child's class attendance logs
  useEffect(() => {
    if (!activeStudent) {
      setAttendanceCount(0);
      setHasShownAlert(false);
      return;
    }

    setAttendanceLoading(true);
    const attendanceRef = collection(db, 'attendance');
    const q = query(
      attendanceRef,
      where('studentId', '==', activeStudent.studentId),
      where('status', '==', 'Present')
    );

    // Track in real-time if a coach checks them in during class
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const count = snapshot.size;
      setAttendanceCount(count);
      setAttendanceLoading(false);

      const { required } = getRequiredClassesForCurrentBelt(activeStudent.beltLevel);
      if (count >= required && !hasShownAlert) {
        setHasShownAlert(true);
        // Play traditional resonant Karate Bell chime
        playKarateBell();

        // Push real browser notification if supported and allowed
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🥋 Lions Karate Exam Stage Reached!', {
            body: `${activeStudent.fullName} completed ${count}/${required} classes! Now eligible for the upcoming ranking belt test.`,
            tag: 'lkcp-exam-alert'
          });
        }
      }
    }, (error) => {
      console.error("Failed to load student attendance logs:", error);
      setAttendanceLoading(false);
    });

    return () => unsubscribe();
  }, [activeStudent, hasShownAlert]);

  // Sync scheduled exams dynamically from db
  useEffect(() => {
    setSchedulesLoading(true);
    const schedulesRef = collection(db, 'exam_schedules');
    const unsubscribe = onSnapshot(schedulesRef, (snapshot) => {
      const records: any[] = [];
      snapshot.forEach((docSnap) => {
        records.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      records.sort((a, b) => b.createdAt - a.createdAt);
      setExamSchedules(records);
      setSchedulesLoading(false);
    }, (error) => {
      console.error("Failed to load upcoming exam schedules:", error);
      setSchedulesLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto-lookup if there's a stored ID in localStorage to keep sessions fast & premium
  useEffect(() => {
    const savedId = localStorage.getItem('lkcp_portal_student_id');
    if (savedId) {
      setStudentIdInput(savedId);
      performLookup(savedId);
    }
  }, []);

  // Fetch student exams list dynamically when activeStudent changes
  useEffect(() => {
    if (!activeStudent) {
      setRegisteredExams([]);
      return;
    }

    setExamsLoading(true);
    const examsRef = collection(db, 'exams');
    const q = query(examsRef, where('studentId', '==', activeStudent.studentId));

    // Listen to real-time updates as coach updates grades in backend
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records: ExamRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push({
          id: docSnap.id,
          ...docSnap.data()
        } as ExamRecord);
      });
      // Sort newest first
      records.sort((a, b) => b.createdAt - a.createdAt);
      setRegisteredExams(records);
      setExamsLoading(false);
    }, (error) => {
      console.error("Failed to load historical exams:", error);
      setExamsLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'exams');
    });

    return () => unsubscribe();
  }, [activeStudent]);

  const performLookup = async (idToSearch: string) => {
    const searchId = idToSearch.trim().toUpperCase();
    if (!searchId) return;

    setSearching(true);
    setSearchError('');
    setActiveStudent(null);

    try {
      const admissionsRef = collection(db, 'admissions');
      // Search for admissions by formatted studentId
      const q = query(
        admissionsRef, 
        where('studentId', '==', searchId)
      );
      
      const snap = await getDocs(q);
      const approvedDocs = snap.docs.filter(doc => doc.data().status === 'approved');

      if (approvedDocs.length === 0) {
        setSearchError('No approved student found matching this Roll ID. (Note: Admission must be Approved by the coach first).');
      } else {
        const studentDoc = approvedDocs[0];
        const studentData = {
          id: studentDoc.id,
          ...studentDoc.data()
        } as Admission;
        
        setActiveStudent(studentData);
        localStorage.setItem('lkcp_portal_student_id', searchId);
        
        // Pre-fill exam form details
        setParentName(studentData.parentName || '');
        setParentPhone(studentData.phone || '');
        setBranch(studentData.branch || DOJO_BRANCHES[0].name);
        setSchoolName(studentData.schoolName || '');

        // Intelligently guess the next belt rank for the student
        const studentBeltLevel = studentData.beltLevel || '';
        const currentIdx = BELT_LEVELS.findIndex(b => b.name && studentBeltLevel && studentBeltLevel.includes(b.name.split(' (')[0]));
        if (currentIdx !== -1 && currentIdx < BELT_LEVELS.length - 1) {
          setTargetBelt(BELT_LEVELS[currentIdx + 1].name);
        } else {
          setTargetBelt(BELT_LEVELS[1].name); // Fallback to Yellow Belt
        }
      }
    } catch (err: any) {
      console.error("Error looking up student ID:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setSearchError(`An unexpected server error occurred: ${errorMessage}. Please try searching again.`);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(studentIdInput);
  };

  const handleLogoutPortal = () => {
    setActiveStudent(null);
    setStudentIdInput('');
    setSearchError('');
    localStorage.removeItem('lkcp_portal_student_id');
  };

  // Generate customized Year Sequence ID: LKCP-YYYY-XXX safely without breaking sequences
  const generateUniqueStudentId = async (): Promise<string> => {
    const currentYear = new Date().getFullYear();
    try {
      const admissionsRef = collection(db, 'admissions');
      // Query admissions from this year to calculate next serial
      const q = query(admissionsRef, where('createdAt', '>=', new Date(`${currentYear}-01-01`).getTime()));
      const snap = await getDocs(q);
      
      let count = snap.size + 100;
      let uniqueId = `LKCP-${currentYear}-${String(count).padStart(3, '0')}`;
      
      // Secondary check to ensure ID sequence is strictly unbroken and collision-free
      let isDuplicate = true;
      while (isDuplicate) {
        const checkQ = query(admissionsRef, where('studentId', '==', uniqueId));
        const checkSnap = await getDocs(checkQ);
        if (checkSnap.empty) {
          isDuplicate = false;
        } else {
          count++;
          uniqueId = `LKCP-${currentYear}-${String(count).padStart(3, '0')}`;
        }
      }
      return uniqueId;
    } catch (err) {
      console.error("Fallback generating direct ID:", err);
      const randomId = Math.floor(100 + Math.random() * 900);
      return `LKCP-${currentYear}-${randomId}`;
    }
  };

  const handleRegisterExam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isNew = activeTab === 'exam' && !activeStudent && examMode === 'new';
    
    if (!isNew && !activeStudent) return;

    if (isNew) {
      if (!newStudentName.trim()) {
        setFormError("Please enter your child's full name.");
        return;
      }
      if (!newStudentCurrentBelt) {
        setFormError("Please select your child's current belt level.");
        return;
      }
    }

    if (!targetBelt) {
      setFormError('Please select a target Belt Level.');
      return;
    }
    if (!coachName) {
      setFormError('Please specify your Instructor / Coach Name.');
      return;
    }
    if (!branch) {
      setFormError('Please select your Dojo training Branch.');
      return;
    }
    if (!parentName.trim()) {
      setFormError('Please enter Parent / Guardian Name.');
      return;
    }
    if (!parentPhone.trim()) {
      setFormError('Please enter Parent Phone Number.');
      return;
    }

    setFormLoading(true);
    setFormError('');
    setFormSuccess(false);

    try {
      const selectedSched = examSchedules.find(s => s.id === selectedScheduleId);

      let studentId = '';
      let studentName = '';
      let currentBeltVal = '';

      if (isNew) {
        studentId = await generateUniqueStudentId();
        studentName = newStudentName.trim();
        currentBeltVal = newStudentCurrentBelt;

        // Automatically create an approved student admission record in the backend
        const admissionPayload = {
          studentId: studentId,
          fullName: studentName,
          dob: '',
          gender: 'other',
          parentName: parentName.trim(),
          phone: parentPhone.trim(),
          whatsApp: parentPhone.trim(),
          email: '',
          address: '',
          batch: 'School Student Batch',
          beltLevel: currentBeltVal,
          photoUrl: '', // standard avatar / blank
          termsAccepted: true,
          status: 'approved',
          createdAt: Date.now(),
          approvedAt: Date.now(),
          isDirectExamRegistration: true,
          branch: branch,
          schoolName: schoolName.trim()
        };

        await addDoc(collection(db, 'admissions'), admissionPayload);
      } else {
        if (!activeStudent) throw new Error('Active student context missing');
        studentId = activeStudent.studentId;
        studentName = activeStudent.fullName;
        currentBeltVal = activeStudent.beltLevel;
      }

      const examData = {
        studentId: studentId,
        studentName: studentName,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        branch: branch,
        coachName: coachName.trim(),
        currentBelt: currentBeltVal,
        targetBelt: targetBelt,
        status: 'pending', // Starts as pending until validated/paid
        feesStatus: feesStatus,
        examScheduleId: selectedScheduleId || '',
        examDate: selectedSched ? selectedSched.examDate : '',
        venueDetails: selectedSched ? selectedSched.venueDetails : '',
        schoolName: schoolName.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await addDoc(collection(db, 'exams'), examData);

      // Save/Switch to the active student session so parents can see results instantly
      const newStudentData: Admission = {
        id: studentId,
        studentId: studentId,
        fullName: studentName,
        parentName: parentName.trim(),
        phone: parentPhone.trim(),
        beltLevel: currentBeltVal,
        branch: branch,
        status: 'approved',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        dob: '',
        schoolName: schoolName.trim(),
        gender: 'other',
        whatsApp: parentPhone.trim(),
        email: '',
        address: '',
        batch: 'School Student Batch',
        photoUrl: '',
        age: 10
      };

      localStorage.setItem('lkcp_portal_student_id', studentId);
      setActiveStudent(newStudentData);
      setStudentIdInput(studentId);

      setSuccessInfo({
        studentName: studentName,
        targetBelt: targetBelt
      });
      setFormSuccess(true);
      setShowExamForm(false);
      
      // Clear selections
      setNewStudentName('');
      setSelectedScheduleId('');
      setCoachName('');
      setFeesStatus('Pending');

      // Trigger beautiful sound effect & confetti celebrations
      try {
        playKarateBell();
      } catch (soundErr) {
        console.error("Sound play issue:", soundErr);
      }

      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          zIndex: 10000
        });

        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 40 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
      } catch (confettiErr) {
        console.error("Confetti issue:", confettiErr);
      }
    } catch (err: any) {
      console.error("Failed to register exam:", err);
      setFormError(err.message || 'Verification failed. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Check for currently pending or approved upcoming registrations
  const existingPendingOrApproved = registeredExams.find(
    exam => exam.status === 'pending' || exam.status === 'approved'
  );

  const isWhiteBeltOrFirstTime = activeStudent && (
    activeStudent.beltLevel?.toLowerCase().includes('white') || 
    activeStudent.beltLevel?.toLowerCase().includes('10th kyu') ||
    registeredExams.length === 0
  );

  // Format simple dates
  const formatDate = (ms: number) => {
    if (!ms) return 'N/A';
    return new Date(ms).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-slate-950 py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* SEGMENTED TABS CONTROLS */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-xl max-w-lg mx-auto mb-10 border border-zinc-900 w-full animate-fade-in gap-1">
          <button
            onClick={() => setActiveTabState('progress')}
            type="button"
            className={`flex-1 py-2.5 sm:py-3 text-center rounded-lg font-heading font-black text-[9px] xs:text-[10px] sm:text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1 sm:space-x-2 px-1 sm:px-3 ${
              activeTab === 'progress'
                ? 'bg-yellow-500 text-slate-950 shadow-md font-black animate-fade-in'
                : 'text-zinc-400 hover:text-white hover:bg-slate-850/50'
            }`}
          >
            <Award className="w-3.5 h-3.5 hidden xs:block shrink-0" />
            <span>Check Results</span>
          </button>
          <button
            onClick={() => {
              setActiveTabState('exam');
              if (activeStudent) {
                setShowExamForm(true);
              }
            }}
            type="button"
            className={`flex-1 py-2.5 sm:py-3 text-center rounded-lg font-heading font-black text-[9px] xs:text-[10px] sm:text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1 sm:space-x-2 px-1 sm:px-3 ${
              activeTab === 'exam'
                ? 'bg-[#FF3B3F] text-white shadow-md font-black animate-fade-in'
                : 'text-zinc-400 hover:text-white hover:bg-slate-850/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 hidden xs:block shrink-0" />
            <span>Apply For Exam</span>
          </button>
          <button
            onClick={() => setActiveTabState('attendance')}
            type="button"
            className={`flex-1 py-2.5 sm:py-3 text-center rounded-lg font-heading font-black text-[9px] xs:text-[10px] sm:text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1 sm:space-x-2 px-1 sm:px-3 ${
              activeTab === 'attendance'
                ? 'bg-emerald-500 text-white shadow-md font-black animate-fade-in'
                : 'text-zinc-400 hover:text-white hover:bg-slate-850/50'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 hidden xs:block shrink-0" />
            <span>Attendance</span>
          </button>
        </div>

        {/* Header Header */}
        <div className="text-center space-y-3 mb-10 max-w-2xl mx-auto">
          {activeTab === 'progress' ? (
            <>
              <div className="inline-flex items-center space-x-2 bg-yellow-500/10 text-yellow-500 text-[10px] font-heading font-black tracking-widest px-3 py-1 rounded-full uppercase border border-yellow-500/15">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>STUDENT PORTAL</span>
              </div>
              <h2 className="font-title text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-none uppercase">
                Check Belt <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #e5e5e5' }}>Results</span>
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm">
                Enter your child's Karate Roll ID to view their current belt level, results, and past exam history.
              </p>
            </>
          ) : activeTab === 'exam' ? (
            <>
              <div className="inline-flex items-center space-x-2 bg-red-500/10 text-[#FF3B3F] text-[10px] font-heading font-black tracking-widest px-3 py-1 rounded-full uppercase border border-red-500/15">
                <Calendar className="w-3.5 h-3.5" />
                <span>EXAM APPLICATION</span>
              </div>
              <h2 className="font-title text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-none uppercase">
                Apply For <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #e5e5e5' }}>Belt Exam</span>
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm">
                Register your child for an upcoming ranking belt exam. First enter their Karate Roll ID below, then choose their next level belt.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 text-[10px] font-heading font-black tracking-widest px-3 py-1 rounded-full uppercase border border-emerald-500/15">
                <ClipboardList className="w-3.5 h-3.5" />
                <span>COACHING REGISTER</span>
              </div>
              <h2 className="font-title text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-none uppercase">
                Attendance <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #e5e5e5' }}>Tracker</span>
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm">
                Daily attendance logs, bulk registration shortcuts, and instant parent notification broadcasters over WhatsApp.
              </p>
            </>
          )}
        </div>

        {/* LOOKUP FORM & DIRECT NEW EXAM REGISTRATION SWITCH */}
        {!activeStudent && activeTab !== 'attendance' && (
          <div className="space-y-6">
            {activeTab === 'exam' && (
              <div className="space-y-4 mb-5 max-w-md mx-auto">
                <div className="flex bg-slate-900/40 p-1.5 rounded-xl border border-zinc-900 w-full gap-1">
                  <button
                    type="button"
                    onClick={() => setExamMode('verify')}
                    className={`flex-1 py-2.5 px-2 text-center rounded-lg font-heading transition-all cursor-pointer flex flex-col items-center justify-center ${
                      examMode === 'verify'
                        ? 'bg-[#FF3B3F] text-white shadow-md font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="font-black text-[10.5px] uppercase tracking-wider">Existing Student</span>
                    <span className="text-[9px] opacity-85 font-medium mt-0.5 font-sans">पहले से छात्र हैं (ID है)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExamMode('new');
                      // Set defaults for direct registration
                      setParentName('');
                      setParentPhone('');
                      setBranch(DOJO_BRANCHES[0].name);
                      setTargetBelt(BELT_LEVELS[1].name); // Yellow Belt
                      setCoachName('');
                    }}
                    className={`flex-1 py-2.5 px-2 text-center rounded-lg font-heading transition-all cursor-pointer flex flex-col items-center justify-center ${
                      examMode === 'new'
                        ? 'bg-[#FF3B3F] text-white shadow-md font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="font-black text-[10.5px] uppercase tracking-wider">School Student</span>
                    <span className="text-[9px] opacity-85 font-medium mt-0.5 font-sans">स्कूल के छात्र (ID नहीं है)</span>
                  </button>
                </div>

                {/* Elegant Bilingual Explainer Alert Box */}
                <div className="bg-slate-950/80 border border-zinc-900 rounded-xl p-4 text-left space-y-3 shadow-inner">
                  <div className="flex items-start space-x-3">
                    <Info className="w-4 h-4 text-[#FF3B3F] mt-0.5 shrink-0" />
                    <div className="space-y-2 text-[11px] leading-relaxed">
                      {examMode === 'verify' ? (
                        <>
                          <div className="text-zinc-300 font-sans">
                            <span className="text-[#FF3B3F] font-bold">English:</span> Use this if your child is already registered with us and has a Karate Roll ID (e.g. <strong className="text-white font-mono">LKCP-2026-004</strong>).
                          </div>
                          <div className="text-zinc-400 border-t border-zinc-900/60 pt-2 font-sans">
                            <span className="text-[#FF3B3F] font-bold">हिंदी में:</span> इस विकल्प को तब चुनें जब आपके बच्चे के पास पहले से ही कराटे रोल ID (<strong className="text-zinc-200 font-mono">LKCP-</strong> से शुरू होने वाला) मौजूद हो।
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-zinc-300 font-sans">
                            <span className="text-[#FF3B3F] font-bold">English:</span> Use this for school students who do not have an ID yet. Fill out the form, and a unique Roll ID will be created and activated instantly.
                          </div>
                          <div className="text-zinc-400 border-t border-zinc-900/60 pt-2 font-sans">
                            <span className="text-[#FF3B3F] font-bold">हिंदी में:</span> नए स्कूली छात्रों के लिए इस विकल्प को चुनें जिनके पास अभी कराटे रोल ID नहीं है। फॉर्म भरें, और सबमिट करते ही एक नया रोल ID तुरंत बन जाएगा।
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'progress' || examMode === 'verify') ? (
              <div className="bg-slate-900/40 border border-zinc-900 p-6 sm:p-8 rounded-2xl relative shadow-2xl">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
                
                <form onSubmit={handleSearchSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="student-portal-id" className="text-zinc-400 text-xs font-heading font-black uppercase tracking-wider block mb-2 text-left">
                      {activeTab === 'exam' ? "Enter your child's Karate Roll ID to start" : "Enter your child's Karate Roll ID"}
                    </label>
                    <div className="flex gap-2 sm:gap-3 items-stretch">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-650">
                          <Award className={`w-5 h-5 ${activeTab === 'exam' ? 'text-red-500/60' : 'text-zinc-550'}`} />
                        </div>
                        <input
                          id="student-portal-id"
                          type="text"
                          required
                          value={studentIdInput}
                          onChange={(e) => setStudentIdInput(e.target.value)}
                          placeholder="e.g. LKCP-2026-004"
                          className={`w-full bg-slate-950 border pl-11 pr-4 py-3.5 text-sm font-mono tracking-widest text-white rounded-xl focus:outline-none transition-colors uppercase placeholder:text-zinc-700 ${
                            activeTab === 'exam' ? 'border-zinc-850 focus:border-red-500/60' : 'border-zinc-850 focus:border-yellow-500/60'
                          }`}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={searching || !studentIdInput.trim()}
                        className={`font-heading font-black text-xs uppercase tracking-widest px-5 sm:px-7 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-55 cursor-pointer shadow-md shrink-0 ${
                          activeTab === 'exam' 
                            ? 'bg-[#FF3B3F] hover:bg-red-500 text-white shadow-red-500/5' 
                            : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-yellow-500/5'
                        }`}
                      >
                        {searching ? (
                          <RefreshCw className={`w-4 h-4 animate-spin ${activeTab === 'exam' ? 'text-white' : 'text-slate-950'}`} />
                        ) : (
                          <>
                            <Search className={`w-4 h-4 ${activeTab === 'exam' ? 'text-white' : 'text-slate-950'}`} />
                            <span className="font-extrabold">{activeTab === 'exam' ? 'Verify ID' : 'Search'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {searchError && (
                    <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex items-start space-x-3 text-red-400 text-xs shadow-inner">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                      <span className="leading-relaxed">{searchError}</span>
                    </div>
                  )}

                  <div className="bg-slate-950/60 ring-1 ring-zinc-900 rounded-xl p-4 text-[11px] text-zinc-500 leading-relaxed font-sans flex items-center space-x-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      <strong>Need help?</strong> Your child's Karate Roll ID starts with <strong>LKCP-</strong> (for example: LKCP-2026-004). You can find this on your admission receipt, or ask their Karate Coach directly on WhatsApp anytime!
                    </span>
                  </div>

                  <div className="pt-4 border-t border-zinc-900/60 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
                    <div className="text-[11px] text-zinc-400 max-w-md">
                      <span className="font-bold text-zinc-300 block">No Student ID issued yet?</span>
                      If you train offline or are registering for the first time, fill out the quick digital admission online to instantly generate your verified Roll ID.
                    </div>
                    <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('admission')}
                          type="button"
                          className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/25 hover:border-yellow-500/40 text-yellow-500 font-heading font-black text-[10px] uppercase tracking-wider px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-center"
                        >
                          Apply Online
                        </button>
                      )}
                      <a
                        href="https://wa.me/919049688172?text=Hello%20Sensei,%20I'm%20trying%2520to%20register%20for%20the%2520upcoming%20Karate%20Belt%20Exam%20and%20need%20my%20child's%20Student%2520ID.%20Please%20help!"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 font-heading font-black text-[10px] uppercase tracking-wider px-3.5 py-2.5 rounded-lg transition-all text-center inline-flex items-center justify-center cursor-pointer"
                      >
                        Get Help on WhatsApp
                      </a>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              /* DIRECT EXAM FORM FOR NEW SCHOOL STUDENT */
              <form 
                onSubmit={handleRegisterExam}
                className="bg-slate-900/60 border border-zinc-850 p-6 sm:p-8 rounded-2xl relative shadow-xl space-y-5"
              >
                <div className="border-b border-zinc-850 pb-4 text-left">
                  <h4 className="font-title text-base font-extrabold text-white uppercase flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-red-500" />
                      School Student Registration
                    </span>
                    <span className="text-xs text-red-400 font-sans font-medium">/ स्कूल छात्र परीक्षा पंजीकरण (बिना ID)</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed font-sans">
                    Fill out the fields below to register. A unique student Roll ID will be automatically generated! <br/>
                    <span className="text-zinc-400">नीचे विवरण भरें। सबमिट करने पर एक नया छात्र रोल ID अपने आप बन जाएगा!</span>
                  </p>
                </div>

                {formError && (
                  <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-lg flex items-start space-x-2 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">
                      Select Exam Date & Location <span className="text-zinc-500 font-normal">/ परीक्षा की तारीख और स्थान चुनें (Optional)</span>
                    </label>
                    <select
                      value={selectedScheduleId}
                      onChange={(e) => {
                        const schedId = e.target.value;
                        setSelectedScheduleId(schedId);
                        const matched = examSchedules.find(s => s.id === schedId);
                        if (matched) {
                          if (BELT_LEVELS.some(b => b.name === matched.beltLevel)) {
                            setTargetBelt(matched.beltLevel);
                          }
                        }
                      }}
                      className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-red-550"
                    >
                      <option value="">-- Choose an upcoming Exam Date / Venue (Optional) --</option>
                      {examSchedules.map((sched) => (
                         <option key={sched.id} value={sched.id}>
                          {sched.examDate} - Target: {sched.beltLevel} ({sched.venueDetails})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">
                      Student Full Name * <span className="text-zinc-500 font-normal">/ विद्यार्थी का पूरा नाम *</span>
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="Enter Child's Name"
                      className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">
                      Current Belt Rank * <span className="text-zinc-500 font-normal">/ वर्तमान बेल्ट का स्तर *</span>
                    </label>
                    <select
                      required
                      value={newStudentCurrentBelt}
                      onChange={(e) => setNewStudentCurrentBelt(e.target.value)}
                      className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-red-500"
                    >
                      {BELT_LEVELS.map(belt => (
                        <option key={belt.name} value={belt.name}>{belt.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">
                      Next Belt Rank Testing For * <span className="text-zinc-500 font-normal">/ किस बेल्ट के लिए परीक्षा दे रहे हैं *</span>
                    </label>
                    <select
                      required
                      value={targetBelt}
                      onChange={(e) => setTargetBelt(e.target.value)}
                      className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-red-500"
                    >
                      <option value="">Select Target Belt</option>
                      {BELT_LEVELS.map(belt => (
                        <option 
                          key={belt.name} 
                          value={belt.name}
                          disabled={belt.name === newStudentCurrentBelt}
                        >
                          {belt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">
                      Karate Coach / Instructor * <span className="text-zinc-500 font-normal">/ कराटे कोच का नाम *</span>
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={coachName}
                      onChange={(e) => setCoachName(e.target.value)}
                      placeholder="e.g. Sensei Maruti Jadhav"
                      className="w-full bg-slate-950 border border-zinc-850 text-zinc-350 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">
                      Karate Center / Branch * <span className="text-zinc-500 font-normal">/ कराटे सेंटर या ब्रांच *</span>
                    </label>
                    <select
                      required
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-red-500"
                    >
                      {DOJO_BRANCHES.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">
                      Belt Exam Fee Paid? * <span className="text-zinc-500 font-normal">/ बेल्ट परीक्षा शुल्क जमा किया? *</span>
                    </label>
                    <select
                      required
                      value={feesStatus}
                      onChange={(e: any) => setFeesStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-red-500"
                    >
                      <option value="Pending">Not Paid Yet / अभी जमा नहीं किया (Will pay later)</option>
                      <option value="Paid">Paid / जमा कर दिया (Handed over to Coach)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">
                      Parent / Guardian Name * <span className="text-zinc-500 font-normal">/ माता-पिता या अभिभावक का नाम *</span>
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Parent Name"
                      className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">
                      Parent Phone Number * <span className="text-zinc-500 font-normal">/ माता-पिता का मोबाइल नंबर *</span>
                    </label>
                    <input 
                      type="tel" 
                      required 
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">
                      School / Academic Institution Name * <span className="text-zinc-500 font-normal">/ स्कूल या कॉलेज का नाम *</span>
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. Podar International School, Pune"
                      className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/80 p-4 border border-zinc-900 rounded-xl space-y-3 text-left">
                  <p className="text-[10.5px] text-zinc-500 leading-relaxed font-sans">
                    * NOTE: A custom Karate Roll ID (e.g. LKCP-2026-105) will be automatically created on the backend and linked to this child's record. This ID will let you track their belt promotions, grades, and attendance!
                    <br/>
                    <span className="text-zinc-600 block mt-1">
                      * ध्यान दें: आपके बच्चे के रिकॉर्ड के लिए एक कराटे रोल ID (जैसे LKCP-2026-105) अपने आप बन जाएगी। इस ID से आप उनके बेल्ट प्रमोशन, ग्रेड और हाजिरी ट्रैक कर सकेंगे!
                    </span>
                  </p>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-5 py-2 text-[10px] bg-red-500 hover:bg-red-400 text-white font-heading font-black uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shadow-red-500/5"
                    >
                      {formLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Submit & Create ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ACTIVE STUDENT WORKFLOW SCREEN */}
        {searching && !activeStudent && activeTab !== 'attendance' && (
          <div className="mt-8">
            <StudentPortalSkeleton />
          </div>
        )}

        {activeStudent && activeTab !== 'attendance' && (
          <div className="space-y-8">
            
            {/* Student Header row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-zinc-900/80 p-5 rounded-2xl">
              <div className="flex items-center space-x-4">
                {activeStudent.photoUrl ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-500/20 bg-slate-950 shadow-md flex-shrink-0">
                    <img 
                      src={activeStudent.photoUrl} 
                      alt={activeStudent.fullName} 
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-950 border border-zinc-800 flex items-center justify-center text-zinc-650 flex-shrink-0">
                    <User className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-heading font-black text-xs text-yellow-500 font-mono select-all tracking-wider">
                      {activeStudent.studentId}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    <span className="text-[10px] uppercase font-bold text-zinc-500 font-serif">
                      {activeStudent.branch || "Manajinager Branch"}
                    </span>
                  </div>
                  <h3 className="font-title text-xl font-extrabold text-white uppercase tracking-tight mt-1">
                    {activeStudent.fullName}
                  </h3>
                  <p className="text-[10px] text-zinc-500 leading-none mt-1.5 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-zinc-650" />
                    JOINED: {formatDate(activeStudent.joiningDate || activeStudent.approvedAt || activeStudent.createdAt)}
                  </p>

                  {/* Dynamic automated mini skill badges display */}
                  {(() => {
                    const unlocked = getStudentBadges().filter(b => b.isUnlocked);
                    if (unlocked.length === 0) return null;
                    return (
                      <div className="flex flex-wrap items-center gap-1.5 mt-3 select-none">
                        <span className="text-[8px] uppercase font-black text-zinc-500 tracking-wider mr-0.5">Badges:</span>
                        {unlocked.map(badge => {
                          const BadgeIcon = badge.icon;
                          return (
                            <div 
                              key={badge.id}
                              title={`${badge.name}: ${badge.description}`}
                              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border ${badge.borderColor} ${badge.bgColor} ${badge.textColor} text-[8.5px] font-heading font-black uppercase tracking-wide cursor-help shadow-sm transition-all hover:scale-105`}
                            >
                              <BadgeIcon className="w-2.5 h-2.5 shrink-0" />
                              <span>{badge.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="flex items-center space-x-3 self-start md:self-center">
                <button
                  type="button"
                  onClick={handleLogoutPortal}
                  className="bg-slate-950 hover:bg-slate-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white font-heading font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Change Student</span>
                </button>
              </div>
            </div>

            {/* NEW EXAMS REGISTRATION FORM COMPONENT (Sleek Accordion) */}
            <AnimatePresence>
              {(showExamForm || activeTab === 'exam') && !formSuccess && (
                <form 
                  onSubmit={handleRegisterExam}
                  className="bg-slate-900/60 border border-zinc-850 p-6 sm:p-8 rounded-2xl relative shadow-xl space-y-5"
                >
                  <div className="border-b border-zinc-850 pb-4">
                    <h4 className="font-title text-base font-extrabold text-white uppercase flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-yellow-500" />
                      Fill Out Belt Exam Application
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                      Enter the details below to register your child for the next belt exam. Your coach will evaluate them physically during class.
                    </p>
                  </div>

                  {formError && (
                    <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-lg flex items-start space-x-2 text-red-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* ALREADY REGISTERED/DUPLICATE PREVENTER NOTIFICATION */}
                  {existingPendingOrApproved && (
                    <div className="bg-amber-500/10 border-2 border-amber-500/30 p-5 rounded-2xl text-left space-y-3 animate-fade-in relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <AlertCircle className="w-24 h-24 text-amber-500" />
                      </div>
                      <div className="flex items-center space-x-2.5 text-amber-400">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="font-heading font-black text-xs uppercase tracking-wider font-sans">
                          Already Registered!
                        </span>
                      </div>
                      <p className="text-xs text-zinc-350 leading-relaxed font-sans">
                        Dear Parent, our calendar shows that <strong>{activeStudent.fullName}</strong> is already registered for an exam. You do not need to register again unless asked by your coach.
                      </p>
                      
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-zinc-900/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-zinc-300">
                        <div>
                          <strong className="text-zinc-500">Next Belt Target:</strong> {existingPendingOrApproved.targetBelt}
                        </div>
                        <div>
                          <strong className="text-zinc-500">Application Status:</strong>{' '}
                          <span className={`font-bold uppercase ${
                            existingPendingOrApproved.status === 'approved' ? 'text-blue-400' : 'text-yellow-500'
                          }`}>
                            {existingPendingOrApproved.status === 'approved' ? 'Accepted / Slot Given' : 'Waiting for Coach Approval'}
                          </span>
                        </div>
                        {existingPendingOrApproved.examDate && (
                          <div className="col-span-1 sm:col-span-2 text-[11px] text-zinc-400 mt-1 pt-1.5 border-t border-zinc-900/60 font-mono">
                            <span className="text-yellow-500">📅 Scheduled:</span> {existingPendingOrApproved.examDate}
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-amber-400/90 bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/10 flex items-start space-x-2">
                        <span className="shrink-0 text-amber-400 font-bold">⚠️ Notice:</span>
                        <span>
                          Please do <strong>not</strong> apply again for the same belt to avoid double payments. If you have been asked by the Coach to register for a different/next rank, you may safely ignore this and continue below.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* WHITE BELT / FIRST TIME ID VERIFICATION NOTE */}
                  {isWhiteBeltOrFirstTime && (
                    <div className="bg-blue-950/20 border border-blue-500/20 p-4.5 rounded-xl text-left space-y-2 animate-fade-in">
                      <div className="flex items-center space-x-2 text-blue-400">
                        <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                        <span className="font-heading font-black text-xs uppercase tracking-wider font-sans">
                          If this is your child's first time giving an exam:
                        </span>
                      </div>
                      <p className="text-[11.5px] text-zinc-350 leading-relaxed font-sans">
                        Since this is your child's first time applying for a new belt, please note:
                      </p>
                      <ul className="list-disc pl-5 text-[11px] text-zinc-400 space-y-1 font-sans">
                        <li>Your child is registered under Roll ID <strong>{activeStudent.studentId}</strong>. It links their class attendance and karate profile.</li>
                        <li>Please check that your child's name spelling is exactly correct so it is printed perfectly on their official karate certificate.</li>
                        <li>We will test your child in the physical karate center during class week, and update their marks and new belt card here.</li>
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                    <div className="sm:col-span-2">
                      <label className="text-zinc-400 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">Select Exam Date & Location (Optional)</label>
                      <select
                        value={selectedScheduleId}
                        onChange={(e) => {
                          const schedId = e.target.value;
                          setSelectedScheduleId(schedId);
                          const matched = examSchedules.find(s => s.id === schedId);
                          if (matched) {
                            if (BELT_LEVELS.some(b => b.name === matched.beltLevel)) {
                              setTargetBelt(matched.beltLevel);
                            }
                          }
                        }}
                        className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500"
                      >
                        <option value="">-- Choose an upcoming Exam Date / Venue (Optional) --</option>
                        {examSchedules.map((sched) => (
                           <option key={sched.id} value={sched.id}>
                            {sched.examDate} - Target: {sched.beltLevel} ({sched.venueDetails})
                          </option>
                        ))}
                      </select>
                      {selectedScheduleId && (
                        <div className="mt-2 bg-slate-950 p-3.5 border border-zinc-900 rounded-lg text-[11px] text-zinc-400 space-y-1">
                          {(() => {
                            const matched = examSchedules.find(s => s.id === selectedScheduleId);
                            if (!matched) return null;
                            return (
                              <>
                                <p className="font-semibold text-yellow-500">Scheduled Exam Highlight:</p>
                                <p><strong className="text-white">Venue:</strong> {matched.venueDetails}</p>
                                <p><strong className="text-white">Belt:</strong> {matched.beltLevel.includes('All Belt Levels') ? matched.beltLevel : `For candidates testing up to ${matched.beltLevel}`}</p>
                                <p><strong className="text-white">Prerequisites:</strong> {matched.prerequisites}</p>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">Student ID</label>
                      <input 
                        type="text" 
                        disabled 
                        value={activeStudent.studentId}
                        className="w-full bg-slate-950 border border-zinc-900 text-zinc-500 font-mono tracking-widest text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">Current Rank</label>
                      <input 
                        type="text" 
                        disabled 
                        value={activeStudent.beltLevel}
                        className="w-full bg-slate-950 border border-zinc-900 text-zinc-500 text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="text-zinc-400 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">Belt Level Testing For (Next Belt) *</label>
                      <select
                        required
                        value={targetBelt}
                        onChange={(e) => setTargetBelt(e.target.value)}
                        className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500"
                      >
                        <option value="">Select Target Belt</option>
                        {BELT_LEVELS.map(belt => (
                          <option 
                            key={belt.name} 
                            value={belt.name}
                            disabled={belt.name === activeStudent.beltLevel}
                          >
                            {belt.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-400 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">Your Child's Karate Coach *</label>
                      <input 
                        type="text" 
                        required 
                        value={coachName}
                        onChange={(e) => setCoachName(e.target.value)}
                        placeholder="e.g. Sensei Maruti Jadhav"
                        className="w-full bg-slate-950 border border-zinc-850 text-zinc-350 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">Karate Center / Branch *</label>
                      <select
                        required
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500"
                      >
                        {DOJO_BRANCHES.map(b => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-400 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">Belt Exam Fee Paid? *</label>
                      <select
                        required
                        value={feesStatus}
                        onChange={(e: any) => setFeesStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500"
                      >
                        <option value="Pending">Not Paid Yet (Will pay at the center later)</option>
                        <option value="Paid">Paid (Already handed over to the Coach)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-400 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">Parent / Guardian Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="Parent Name"
                        className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">Parent Phone Number *</label>
                      <input 
                        type="tel" 
                        required 
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">School / Academic Institution Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="e.g. Podar International School, Pune"
                        className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-4 border border-zinc-900 rounded-xl space-y-3">
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                      * NOTE: After submitting, please hand over the physical belt exam fee directly to your child's coach at the center if not paid already.
                    </p>
                    <div className="flex justify-end space-x-3 pt-2">
                      {activeTab === 'exam' ? (
                        <button
                          type="button"
                          onClick={() => setActiveTabState('progress')}
                          className="px-4 py-2 text-[10px] font-heading font-black uppercase tracking-wider text-zinc-400 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowExamForm(false)}
                          className="px-4 py-2 text-[10px] font-heading font-black uppercase tracking-wider text-zinc-400 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={formLoading}
                        className={`px-5 py-2 text-[10px] font-heading font-black uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer shadow-md ${
                          activeTab === 'exam' 
                            ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/5' 
                            : 'bg-yellow-500 hover:bg-yellow-405 text-slate-950 shadow-yellow-500/5'
                        }`}
                      >
                        {formLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Submit Exam Application</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </AnimatePresence>

            {formSuccess && successInfo && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 p-6 sm:p-8 rounded-2xl relative shadow-2xl animate-fade-in text-center overflow-hidden max-w-xl mx-auto my-6 text-zinc-100"
              >
                {/* Decorative glow */}
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 mb-4 animate-bounce">
                  <Award className="w-8 h-8 text-amber-500" />
                </div>

                <div className="space-y-4">
                  <span className="font-heading font-black text-xs sm:text-sm uppercase text-amber-500 tracking-[0.15em] block">
                    🥋 RESPECT. DISCIPLINE. PERSEVERANCE.
                  </span>
                  
                  <h4 className="font-title text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    Registration Confirmed!
                  </h4>

                  <p className="text-zinc-350 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                    Thank you, Parent! <strong className="text-amber-400 font-bold">{successInfo.studentName}</strong> is now officially registered to challenge the <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold font-mono text-[11px] sm:text-xs">{successInfo.targetBelt}</span> standard. We are honored to accompany them on this sacred journey of self-improvement.
                  </p>

                  <div className="bg-slate-950/80 p-4 border border-zinc-900/60 rounded-xl space-y-2 max-w-sm mx-auto text-left text-[11px] text-zinc-400 font-sans">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Student Name:</span>
                      <strong className="text-zinc-200">{successInfo.studentName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Target Level:</span>
                      <strong className="text-amber-500">{successInfo.targetBelt}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Status:</span>
                      <strong className="text-yellow-500 uppercase tracking-wider">Pending Verification</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormSuccess(false);
                        setSuccessInfo(null);
                      }}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-heading font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-lg shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer w-full sm:w-auto"
                    >
                      Awesome, Thank You
                    </button>
                    <a
                      href={`https://wa.me/919049688172?text=${encodeURIComponent(`🥋 Lions Karate Club: registered ${successInfo.studentName} for the ${successInfo.targetBelt} Belt Exam!`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-lg shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 w-full sm:w-auto"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Notify on WhatsApp
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AUTOMATED ELIGIBILITY ALERT CARD */}
            {activeTab === 'progress' && (() => {
              const { required, nextBelt } = getRequiredClassesForCurrentBelt(activeStudent.beltLevel);
              const isEligible = attendanceCount >= required;
              // Find any upcoming exam schedule that matches the student's branch or target belt
              const nextExam = examSchedules.length > 0 ? examSchedules[0] : null;

              if (attendanceLoading) {
                return (
                  <AttendanceSkeleton />
                );
              }

              if (isEligible) {
                const parentText = `Hello Coach Shihan Maruti Jadhav, my child *${activeStudent.fullName}* (Roll ID: *${activeStudent.studentId}*) has successfully completed *${attendanceCount}/${required}* classes and is fully eligible for promotion to *${nextBelt}*! Please find our request for the upcoming belt test slot. Thank you!`;
                const encodedParentText = encodeURIComponent(parentText);
                const parentWhatsAppUrl = `https://wa.me/919049688172?text=${encodedParentText}`;

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-slate-950 border-2 border-yellow-500 p-6 rounded-2xl shadow-xl overflow-hidden animate-fade-in group text-left"
                  >
                    <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:scale-110 pointer-events-none transition-transform">
                      <GraduationCap className="w-24 h-24 text-yellow-500 animate-pulse" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="space-y-2.5 max-w-xl">
                        <div className="flex items-center space-x-2">
                          <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                          </span>
                          <span className="text-[10px] font-heading font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-2.5 py-1 rounded-md border border-yellow-500/15">
                            Exam Stage Reached! 🎉
                          </span>
                        </div>
                        
                        <h4 className="font-title text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                          Eligible For Promotion Exam!
                        </h4>
                        
                        <p className="text-zinc-350 text-xs leading-relaxed font-sans">
                          Awesome work! <strong>{activeStudent.fullName}</strong> has completed <strong>{attendanceCount}</strong> classes of high-intensity training. The required promotion milestone for their rank is <strong>{required}</strong> classes. They are now fully qualified to apply for the <strong>{nextBelt}</strong> test!
                        </p>

                        {nextExam ? (
                          <div className="bg-slate-950/80 border border-zinc-850 p-3.5 rounded-xl text-[11px] text-zinc-400 mt-3 font-sans space-y-1">
                            <div className="text-yellow-500 font-extrabold flex items-center gap-1 uppercase tracking-wider text-[10px]">
                              <Calendar className="w-3.5 h-3.5" /> Upcoming Scheduled Exam Date:
                            </div>
                            <div>
                              📅 <strong>{nextExam.examDate}</strong> @ <strong>{nextExam.venueDetails || "Lions Main Dojo Gym"}</strong>
                            </div>
                            <div className="italic text-zinc-550 mt-1">
                              Prerequisites: {nextExam.prerequisites || "Full LKCP Dojo Uniform (Gi) and approved belt guards."}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-zinc-550 italic mt-2">
                            The upcoming scheduling test slots are being determined. Standard fees and Gi review instructions will be announced soon.
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 self-stretch md:self-center justify-center md:min-w-[210px]">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTabState('exam');
                            setShowExamForm(true);
                          }}
                          className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-heading font-black text-[10px] uppercase tracking-wider px-5 py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-yellow-500/5 text-center flex items-center justify-center gap-2"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-slate-950" />
                          <span>Apply For Exam Now</span>
                        </button>

                        <a
                          href={parentWhatsAppUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-black text-[10px] uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md text-center flex items-center justify-center gap-2 cursor-pointer no-underline"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-white animate-bounce" />
                          <span>Send WhatsApp Alert</span>
                        </a>

                        {'Notification' in window && Notification.permission !== 'granted' && (
                          <button
                            type="button"
                            onClick={async () => {
                              const permission = await Notification.requestPermission();
                              if (permission === 'granted') {
                                new Notification('Lions Karate Club', {
                                  body: 'Automatic browser-based exam eligibility notification active!'
                                });
                              }
                            }}
                            className="bg-slate-950 hover:bg-slate-900 border border-zinc-850 text-zinc-400 hover:text-white font-heading font-black text-[9px] uppercase tracking-wider py-2 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Bell className="w-3 h-3 text-yellow-500 animate-pulse" />
                            <span>Allow Push Alerts</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              } else {
                const pct = Math.min(100, Math.floor((attendanceCount / required) * 100));
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/10 border border-zinc-900 p-5 rounded-2xl text-left"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-grow">
                        <span className="text-[9px] font-heading font-black text-yellow-500 bg-yellow-500/5 border border-yellow-500/10 px-2.5 py-1 rounded-md uppercase tracking-widest">
                          Next Promotion Target Stage 🥋
                        </span>
                        <h4 className="font-heading text-xs font-black text-white uppercase tracking-wider mt-1.5">
                          Belt Promo Training Progress
                        </h4>
                        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                          <strong>{activeStudent.fullName}</strong> is working towards their <strong>{nextBelt}</strong> certification. They have successfully attended <strong>{attendanceCount}</strong> classes out of the required <strong>{required}</strong> sessions to qualify for testing.
                        </p>
                      </div>

                      <div className="shrink-0 w-full sm:w-48 text-right self-stretch sm:self-center flex flex-col justify-center">
                        <div className="flex justify-between items-center text-[10px] mb-1.5">
                          <span className="text-zinc-500 uppercase tracking-widest font-heading font-black">Progress Status</span>
                          <span className="font-mono text-white font-bold">{pct}% ({attendanceCount}/{required})</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-zinc-900/60">
                          <div 
                            className="bg-yellow-500 h-full rounded-full transition-all duration-700" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }
            })()}

            {/* VISUAL BELT PROGRESS TIMELINE */}
            {activeTab === 'progress' && (
              <div className="bg-slate-900/40 border border-zinc-900/80 p-6 sm:p-8 rounded-2xl space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                <h4 className="font-heading text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-500 shrink-0" />
                  Karate Belt Progress Path
                </h4>
                <span className="text-[10px] font-mono font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/5 px-2.5 py-1 rounded border border-yellow-500/20 shadow-sm">
                  CHILD'S CURRENT BELT: {activeStudent.beltLevel.split(' (')[0]}
                </span>
              </div>

              {/* Responsive interactive timeline grid of Shotokan Belts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {BELT_LEVELS.map((belt, idx) => {
                  const studentBeltClean = activeStudent.beltLevel.split(' (')[0].toLowerCase();
                  const currentBeltClean = belt.name.split(' (')[0].toLowerCase();
                  
                  // Match logic
                  const isCurrent = studentBeltClean.includes(currentBeltClean) || currentBeltClean.includes(studentBeltClean);
                  
                  return (
                    <div 
                      key={idx}
                      className={`relative p-4 rounded-xl border text-center transition-all duration-300 flex flex-col justify-between items-center ${
                        isCurrent 
                          ? 'border-yellow-500 bg-yellow-500/10 ring-2 ring-yellow-500/20 shadow-lg scale-105 z-10'
                          : 'border-zinc-900 bg-zinc-950/40 opacity-55 hover:opacity-100 hover:border-zinc-800 transition-opacity'
                      }`}
                    >
                      {/* REAL PHYSICAL SHOTOKAN BELT GRAPHIC WITH FABRIC STITCHING & EMBROIDERY */}
                      <div className="w-full flex-grow flex items-center justify-center min-h-[64px]">
                        <KarateBeltGraphic beltName={belt.name} />
                      </div>

                      <span className="text-[10px] font-heading font-black block text-white select-none whitespace-normal leading-tight uppercase tracking-wider mt-2.5">
                        {belt.name.split(' (')[0]}
                      </span>
                      
                      {isCurrent && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-heading text-yellow-500 uppercase tracking-widest font-black bg-slate-950 px-2 py-0.5 rounded-full border border-yellow-550/30 shadow-md">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            )}

            {/* DIGITAL ACHIEVEMENT BADGES (AUTOMATED CRITERIA) */}
            {activeTab === 'progress' && (
              <div className="bg-slate-900/40 border border-zinc-900/80 p-6 sm:p-8 rounded-2xl space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                  <h4 className="font-heading text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500 shrink-0" />
                    Automated Achievement Badges
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/5 px-2.5 py-1 rounded border border-yellow-500/20 shadow-sm">
                    {getStudentBadges().filter(b => b.isUnlocked).length} / 6 EARNED
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed text-left max-w-2xl">
                  Your child earns these special **Digital Skill Badges** automatically on their profile as they attend daily training sessions and challenge belt promotion tests!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getStudentBadges().map(badge => {
                    const BadgeIcon = badge.icon;
                    return (
                      <div 
                        key={badge.id}
                        className={`relative p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 ${
                          badge.isUnlocked 
                            ? `border-zinc-850 bg-slate-950/40 shadow-md hover:scale-[1.02] hover:border-zinc-700/80`
                            : 'border-zinc-900 bg-zinc-950/20 opacity-40'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Badge Icon circle & Unlocked tag */}
                          <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                              badge.isUnlocked 
                                ? `${badge.borderColor} ${badge.bgColor} ${badge.color}`
                                : 'border-zinc-800/40 bg-zinc-900/20 text-zinc-650'
                            }`}>
                              <BadgeIcon className="w-5 h-5" />
                            </div>

                            <span className={`text-[8px] font-heading font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                              badge.isUnlocked 
                                ? 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/10'
                                : 'bg-zinc-900/45 text-zinc-500 border border-zinc-850/40'
                            }`}>
                              {badge.isUnlocked ? 'Unlocked 🏆' : 'Locked 🔒'}
                            </span>
                          </div>

                          {/* Badge Name & Details */}
                          <div>
                            <h5 className={`font-heading text-xs font-black uppercase tracking-wider ${badge.isUnlocked ? 'text-white' : 'text-zinc-500'}`}>
                              {badge.name}
                            </h5>
                            <p className="text-[10px] text-zinc-450 font-sans leading-relaxed mt-1.5">
                              {badge.description}
                            </p>
                          </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mt-4 pt-3 border-t border-zinc-950/50 flex items-center justify-between text-[9px] font-mono">
                          <span className="text-zinc-550 uppercase">Progress:</span>
                          <span className={`font-bold ${badge.isUnlocked ? badge.textColor : 'text-zinc-500'}`}>
                            {badge.progressText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EXAMS & BELT GRADING HISTORICAL TIMELINE REGISTER LOGS */}
            {activeTab === 'progress' && (
              <div className="space-y-4 animate-fade-in">
              <h4 className="font-title text-base font-extrabold text-white uppercase flex items-center gap-2 text-left">
                <ClipboardList className="w-4.5 h-4.5 text-yellow-500" />
                Past Exams & Performance Results
              </h4>

              {examsLoading && (
                <ExamsHistoricalSkeleton />
              )}

              {!examsLoading && registeredExams.length === 0 && (
                <div className="py-12 text-center text-zinc-550 bg-slate-900/10 border border-zinc-900 rounded-2xl p-6">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2.5 text-zinc-750" />
                  <h5 className="font-heading font-bold text-xs uppercase text-zinc-450 tracking-wider">No previous exam records found</h5>
                  <p className="text-[10px] text-zinc-650 mt-1 max-w-sm mx-auto">
                    Once your child registers and attends their first belt exam with the Coach, their grades, marks, and certificates will appear here.
                  </p>
                </div>
              )}

              {!examsLoading && registeredExams.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {registeredExams.map((exam) => (
                    <div 
                      key={exam.id}
                      className="bg-slate-900/30 border border-zinc-900 p-5 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-zinc-850 transition-colors text-left"
                    >
                      <div className="space-y-1.5 flex-grow">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-[10px] font-semibold text-white uppercase bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                            Exam Belt: {exam.targetBelt.split(' (')[0]}
                          </span>
                          <span className="text-[8px] font-mono text-zinc-500">
                            Applied On: {formatDate(exam.createdAt)}
                          </span>
                        </div>

                        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-zinc-400 font-sans bg-slate-950/40 p-3 rounded-xl border border-zinc-900/30">
                          <div>
                            <span className="text-zinc-500 mr-1">Coach Name:</span>
                            <span className="text-zinc-200 font-bold">{exam.coachName || "Sensei Maruti Jadhav"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 mr-1">Karate Center:</span>
                            <span className="text-zinc-200 font-bold">{exam.branch || "Manajinager"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 mr-1">Exam Fees:</span>
                            <span className={`font-extrabold ${exam.feesStatus === 'Paid' ? 'text-emerald-400' : 'text-yellow-500'}`}>
                              {exam.feesStatus === 'Paid' ? 'Paid' : 'Unpaid (Pay at center)'}
                            </span>
                          </div>
                          {exam.examDate && (
                            <div className="col-span-1 sm:col-span-2 mt-1 pt-1.5 border-t border-zinc-900/60 leading-relaxed">
                              <span className="text-yellow-500 font-bold">Exam Date & Venue:</span> <span className="text-zinc-200">{exam.examDate}</span> @ <span className="text-zinc-350 italic">{exam.venueDetails}</span>
                            </div>
                          )}
                        </div>

                        {/* Coach Remarks */}
                        {exam.status === 'passed' && (
                          <div className="bg-slate-950/60 p-3 border border-zinc-900 rounded-xl mt-3 text-xs w-full">
                            <span className="text-[8px] font-heading font-black text-yellow-500 uppercase tracking-widest block mb-1">COACH'S FEEDBACK</span>
                            <p className="text-zinc-350 italic font-medium leading-relaxed">
                              "{exam.remarks || "Great effort and performance shown during the physical belt test."}"
                            </p>
                          </div>
                        )}

                        {exam.status === 'pending' && (
                          <p className="text-zinc-550 text-[10px] italic">
                            Awesome! We are waiting for the karate coach to approve this application and confirm the exam date.
                          </p>
                        )}
                      </div>

                      {/* Side Status Badge indicator block */}
                      <div className="shrink-0 flex items-center space-x-3">
                        {exam.grade && (
                          <div className="text-right">
                            <span className="text-[8px] font-mono text-zinc-550 block leading-none uppercase">GRADE</span>
                            <span className="font-heading font-black text-base text-yellow-500 mt-1 block leading-none font-sans">{exam.grade}</span>
                          </div>
                        )}

                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-widest block mb-1">STATUS</span>
                          
                          {exam.status === 'passed' && (
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="text-[9px] font-heading font-black uppercase text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                                Passed - Belt Awarded!
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedCert(exam)}
                                className="text-[9px] font-heading font-black uppercase text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 px-2.5 py-1 rounded border border-yellow-500/20 transition-all flex items-center space-x-1 cursor-pointer"
                              >
                                <Award className="w-3 h-3 text-yellow-500" />
                                <span>Get Certificate</span>
                              </button>
                            </div>
                          )}
                          
                          {exam.status === 'failed' && (
                            <span className="text-[9px] font-heading font-black uppercase text-red-500 bg-red-510/10 px-2.5 py-1 rounded border border-red-510/20">
                              Practice Required
                            </span>
                          )}

                          {exam.status === 'approved' && (
                            <span className="text-[9px] font-heading font-black uppercase text-blue-500 bg-blue-510/10 px-2.5 py-1 rounded border border-blue-510/20">
                              Exam Date Set
                            </span>
                          )}

                          {exam.status === 'pending' && (
                            <span className="text-[9px] font-heading font-black uppercase text-yellow-500 bg-yellow-505/10 px-2.5 py-1 rounded border border-yellow-550/20">
                              Coach Review Pending
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* DIRECT COACH CONTACT */}
            <div className="bg-slate-900/30 border border-zinc-900 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h5 className="font-heading font-extrabold text-xs text-white uppercase tracking-wider">Having issues, or lost your Student ID?</h5>
                <p className="text-[11px] text-zinc-500 mt-0.5">Reach out to Shihan directly on WhatsApp to get instant support on admissions and roll ID numbers.</p>
              </div>
              <a 
                href="https://wa.me/919049688172?text=Hello%20Lions%20Karate%20Club%252c%20I%20need%20help%20with%20my%20Student%20ID%20Progress%20Tracker%20Roll%20Number."
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-lg flex items-center space-x-1.5 transition-all shadow cursor-auto shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Contact Coach</span>
              </a>
            </div>

          </div>
        )}

        {/* ATTENDANCE TRACKER MAIN PORTAL VIEW */}
        {activeTab === 'attendance' && (
          <div className="animate-fade-in shadow-xl">
            <AttendanceTracker />
          </div>
        )}

        {/* Certificate Modal */}
        {selectedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm print-hide">
            <style>{`
              @media print {
                html, body {
                  background: white !important;
                  background-color: white !important;
                  color: black !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 100% !important;
                  height: 100% !important;
                }
                #root, .print-hide {
                  background: transparent !important;
                  background-color: transparent !important;
                  display: none !important;
                }
                body * {
                  visibility: hidden;
                }
                .printable-certificate, .printable-certificate * {
                  visibility: visible !important;
                }
                .printable-certificate {
                  visibility: visible !important;
                  position: fixed !important;
                  left: 0 !important;
                  top: 0 !important;
                  right: 0 !important;
                  bottom: 0 !important;
                  width: 100% !important;
                  height: 100% !important;
                  margin: 0 !important;
                  padding: 3rem !important;
                  border: 12px double #d97706 !important;
                  background: #fffbeb !important;
                  background-color: #fffbeb !important;
                  color: #0c0a09 !important;
                  box-shadow: none !important;
                  display: flex !important;
                  flex-direction: column !important;
                  justify-content: space-between !important;
                  box-sizing: border-box !important;
                  z-index: 9999999 !important;
                }
                div, section, main, header, footer, [role="dialog"] {
                  background: transparent !important;
                  background-color: transparent !important;
                  box-shadow: none !important;
                  border-color: transparent !important;
                }
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
            `}</style>
            <div className="bg-slate-900 border border-zinc-800 rounded-2xl max-w-4xl w-full p-4 sm:p-6 relative shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print-hide">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div className="text-left">
                  <h3 className="font-heading font-black text-sm uppercase text-yellow-500 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Official Belt Certificate
                  </h3>
                  <p className="text-[10px] text-zinc-500">View and print your child's official karate certificate</p>
                </div>
                <button 
                  onClick={() => setSelectedCert(null)}
                  className="p-1.5 hover:bg-zinc-800/80 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable Frame Area */}
              <div id="printable-certificate-el" className="bg-amber-50/95 text-zinc-950 p-5 sm:p-10 rounded-xl border-8 border-amber-600 shadow-inner relative printable-certificate overflow-hidden text-center aspect-[1.414/1] max-w-full mx-auto font-serif" style={{ borderStyle: 'double', borderWidth: '10px' }}>
                {/* Watermark symbol background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <Award className="w-64 h-64 text-amber-900" />
                </div>

                {/* Elegant Pass Stamp Badge */}
                <div className="absolute top-3 right-3 sm:top-5 sm:right-6 z-20">
                  <div className="border-2 border-emerald-600 text-emerald-600 bg-emerald-50 rounded px-2.5 py-0.5 font-sans font-black text-[9px] sm:text-xs tracking-widest uppercase rotate-12 shadow-sm flex items-center space-x-1">
                    <span>RESULT:</span>
                    <span className="font-sans font-black">PASS</span>
                  </div>
                </div>

                {/* Top Header with official Club Logo */}
                <div className="relative z-10 flex flex-col items-center justify-center space-y-1.5 matches-header">
                  <img
                    src="https://res.cloudinary.com/dlzdagymx/image/upload/q_auto/f_auto/v1781585562/logo_new_t7ctxo.jpg"
                    alt="Lions Karate Club Logo"
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-full bg-white p-0.5 border border-amber-350 shadow-md mb-0.5"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm md:text-base font-sans tracking-[0.2em] text-[#FF3B3F] font-black uppercase text-center leading-none">
                      LIONS KARATE CLUB PUNE
                    </h4>
                    <p className="text-[8px] sm:text-[9px] md:text-[11px] tracking-wider text-zinc-600 uppercase font-sans font-extrabold mt-1">
                      Shotokan Style Approved • Registered Shibu
                    </p>
                  </div>
                </div>

                {/* Main Title */}
                <div className="my-2.5 sm:my-4 md:my-5 relative z-10">
                  <h2 className="font-serif text-base sm:text-xl md:text-3xl font-extrabold text-amber-900 tracking-wide uppercase italic">
                    Certificate of Promotion
                  </h2>
                  <div className="w-20 sm:w-28 h-[1.5px] bg-amber-600 mx-auto mt-1"></div>
                </div>

                {/* Statement body */}
                <div className="space-y-2.5 sm:space-y-3.5 my-3 sm:my-5 md:my-6 text-[10px] sm:text-xs md:text-sm text-zinc-800 max-w-2xl mx-auto relative z-10 leading-relaxed">
                  <p className="italic text-zinc-500 font-serif text-[10px] sm:text-xs">This is to certify that</p>
                  <p className="text-sm sm:text-base md:text-xl font-bold uppercase tracking-wide text-zinc-900 border-b border-zinc-200 pb-1 max-w-md mx-auto font-sans">
                    {activeStudent?.fullName || selectedCert.studentName}
                  </p>
                  <p className="italic text-zinc-500 font-serif leading-relaxed text-[9px] sm:text-[10px] md:text-xs max-w-lg mx-auto">
                    having successfully demonstrated outstanding discipline, character, physical endurance, and required kata/kumite technical proficiency during examinations, is hereby officially promoted to the rank of
                  </p>
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <p className="text-xs sm:text-sm md:text-lg font-extrabold text-amber-700 uppercase tracking-widest font-sans">
                      {selectedCert.targetBelt || "Yellow Belt"}
                    </p>
                    {selectedCert.grade && (
                      <span className="text-[9px] sm:text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Exam Grade: <strong className="font-black text-emerald-800">{selectedCert.grade}</strong>
                      </span>
                    )}
                  </div>
                  <p className="text-[7px] sm:text-[9px] text-zinc-500 mt-1 font-sans">
                    Student ID: <strong className="text-zinc-800">{selectedCert.studentId}</strong> • Exam Roll No: <strong className="text-zinc-800">{selectedCert.id.substring(0, 8).toUpperCase()}</strong>
                  </p>
                  {selectedCert.schoolName && (
                    <p className="text-[8px] sm:text-[10px] text-amber-800 mt-1 font-sans">
                      Academic Institution: <strong className="text-zinc-900 font-bold">{selectedCert.schoolName}</strong>
                    </p>
                  )}
                </div>

                {/* Beautiful Engaging Karate Journey Note */}
                <div className="my-3 sm:my-4 max-w-lg mx-auto bg-amber-100/40 p-2 rounded-lg border border-amber-200/50 relative z-10 text-center font-serif">
                  <p className="italic text-[8px] sm:text-[10px] text-zinc-650 leading-snug">
                    "The ultimate aim of Karate lies not in victory or defeat, but in the perfection of the character of its participants." Remain humble, stay focused, and persist with determination.
                  </p>
                </div>

                {/* Bottom signature slots */}
                <div className="grid grid-cols-2 gap-8 sm:gap-16 mt-4 sm:mt-8 pt-3 relative z-10 text-[9px] sm:text-[11px] text-zinc-700 font-sans">
                  <div className="text-center">
                    <div className="h-5 flex items-end justify-center">
                      <span className="font-serif italic font-semibold text-zinc-600 border-b border-zinc-200 px-4">Sensei Maruti Jadhav</span>
                    </div>
                    <div className="pt-1 mt-1 text-[8px] uppercase tracking-wider font-bold text-zinc-500">
                      Karate Coach / Examiner
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="h-5 flex items-end justify-center">
                      <span className="font-serif italic text-amber-600 font-black">OFFICIAL SEAL</span>
                    </div>
                    <div className="pt-1 mt-1 text-[8px] uppercase tracking-wider font-bold text-zinc-500">
                      Lions Karate Club
                    </div>
                  </div>
                </div>
              </div>

              {/* Print & Download Control Buttons (Hidden when printing) */}
              <div className="mt-4 flex flex-wrap gap-2 justify-end border-t border-zinc-800 pt-3 shrink-0 print-hide">
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="bg-zinc-800 hover:bg-zinc-750 text-zinc-350 text-[10px] font-heading font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-heading font-black uppercase tracking-widest px-4.5 py-2 rounded-lg flex items-center space-x-1.5 shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer"
                  title="Open standard browser print dialog"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  type="button"
                  disabled={downloadingCert}
                  onClick={handleDownloadCertificatePDF}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-750 disabled:text-zinc-500 text-slate-950 text-[10px] font-heading font-black uppercase tracking-widest px-4.5 py-2 rounded-lg flex items-center space-x-1.5 shadow-lg hover:shadow-yellow-500/10 transition-all cursor-pointer"
                  title="Directly download high quality PDF file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingCert ? 'Downloading...' : 'Download Certificate PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

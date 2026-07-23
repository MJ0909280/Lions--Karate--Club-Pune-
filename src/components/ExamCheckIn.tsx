import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Search, UserCheck, Calendar, ShieldCheck, ArrowLeft, Trophy, MapPin, Sparkles, Award, Lock, Check, Edit2, User, Star } from 'lucide-react';
import { DisciplineGrades, GradeValue, calculateOverallGrade } from '../types';

interface ExamCheckInProps {
  onBackToHome: () => void;
  initialTab?: 'checkin' | 'grading';
}

const DISCIPLINES: { key: keyof DisciplineGrades; label: string; icon: string; desc: string }[] = [
  { key: 'run', label: 'RUN', icon: '🏃', desc: 'Sprinting & Aerobic Endurance' },
  { key: 'jump', label: 'JUMP', icon: '🦘', desc: 'Agility & Explosiveness' },
  { key: 'sidesitups', label: 'SIDESITUPS', icon: '🧘', desc: 'Core Strength & Flexibility' },
  { key: 'kicks', label: 'KICKS', icon: '🥋', desc: 'Technique, Height & Power' },
  { key: 'conditionChecking', label: 'CONDITION CHECKING', icon: '💪', desc: 'Body Strength & Resilience' },
  { key: 'kata', label: 'KATA', icon: '⚔️', desc: 'Shotokan Forms & Rhythm' },
  { key: 'kumite', label: 'KUMITE', icon: '🔥', desc: 'Sparring & Fighting Spirit' },
];

const GRADE_OPTIONS: GradeValue[] = ['A+', 'A', 'B+', 'B', 'C', 'F'];

export default function ExamCheckIn({ onBackToHome, initialTab = 'checkin' }: ExamCheckInProps) {
  const [activeTab, setActiveTab] = useState<'checkin' | 'grading'>(initialTab);
  
  // Roster state
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(6);

  // Examiner Login State
  const [examinerName, setExaminerName] = useState(() => localStorage.getItem('examiner_name') || '');
  const [examinerPin, setExaminerPin] = useState('');
  const [isExaminerUnlocked, setIsExaminerUnlocked] = useState(() => localStorage.getItem('examiner_unlocked') === 'true');
  const [examinerAuthError, setExaminerAuthError] = useState('');

  // Examiner Grading Candidate State
  const [gradingSearch, setGradingSearch] = useState('');
  const [selectedGradingStudent, setSelectedGradingStudent] = useState<any | null>(null);
  const [gradesInput, setGradesInput] = useState<DisciplineGrades>({});
  const [gradeSaveSuccess, setGradeSaveSuccess] = useState(false);
  const [gradeSaveError, setGradeSaveError] = useState('');

  const getBeltColorClasses = (beltName: string = '') => {
    const name = beltName.toLowerCase();
    if (name.includes('yellow')) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-500', dot: 'bg-yellow-500' };
    if (name.includes('orange')) return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-500', dot: 'bg-orange-500' };
    if (name.includes('green')) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' };
    if (name.includes('blue')) return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-500' };
    if (name.includes('purple')) return { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-500' };
    if (name.includes('brown')) return { bg: 'bg-amber-900/20', border: 'border-amber-800/30', text: 'text-amber-600', dot: 'bg-amber-800' };
    if (name.includes('black')) return { bg: 'bg-zinc-800/20', border: 'border-zinc-700/50', text: 'text-zinc-200', dot: 'bg-zinc-300' };
    return { bg: 'bg-slate-900/60', border: 'border-zinc-800', text: 'text-white', dot: 'bg-white' };
  };

  const getGradeBadgeColor = (grade?: GradeValue) => {
    switch (grade) {
      case 'A+': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'A': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'B+': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'B': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'C': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      case 'F': return 'bg-red-500/15 text-red-400 border-red-500/30';
      default: return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    }
  };

  // Synchronize candidate list from Firestore exams collection in real time
  useEffect(() => {
    const examsRef = collection(db, 'exams');
    const unsubscribe = onSnapshot(examsRef, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Sort candidates alphabetically by name
      list.sort((a, b) => (a.studentName || '').localeCompare(b.studentName || ''));
      setCandidates(list);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load candidates:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Countdown timer for automatic redirect back to roster search
  useEffect(() => {
    let timer: any;
    if (checkInSuccess) {
      setCountdown(6);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setSelectedStudent(null);
            setSearchQuery('');
            setCheckInSuccess(false);
            return 6;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [checkInSuccess]);

  const handleResetSearch = () => {
    setSelectedStudent(null);
    setSearchQuery('');
    setCheckInSuccess(false);
  };

  // Filter candidates for check-in
  const filteredCandidates = candidates.filter(c => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false;
    
    const idMatch = (c.studentId || '').toLowerCase().includes(query);
    const nameMatch = (c.studentName || '').toLowerCase().includes(query);
    const parentMatch = (c.parentName || '').toLowerCase().includes(query);
    const phoneMatch = (c.parentPhone || '').toLowerCase().includes(query);

    return idMatch || nameMatch || parentMatch || phoneMatch;
  });

  // Filter candidates for grading
  const filteredGradingCandidates = candidates.filter(c => {
    const query = gradingSearch.toLowerCase().trim();
    if (!query) return false;
    
    const idMatch = (c.studentId || '').toLowerCase().includes(query);
    const nameMatch = (c.studentName || '').toLowerCase().includes(query);

    return idMatch || nameMatch;
  });

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setCheckInSuccess(false);
    setErrorMsg('');
  };

  const handleConfirmAttendance = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const examRef = doc(db, 'exams', selectedStudent.id);
      const timestamp = Date.now();
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      await updateDoc(examRef, {
        checkedIn: true,
        checkInTime: timeString,
        checkInTimestamp: timestamp,
        updatedAt: timestamp
      });

      setSelectedStudent(prev => prev ? { ...prev, checkedIn: true, checkInTime: timeString } : null);
      setCheckInSuccess(true);
    } catch (err: any) {
      console.error("Check-in error:", err);
      setErrorMsg("Failed to complete check-in. Please try again or ask sensei.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Examiner Login Handle
  const handleExaminerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setExaminerAuthError('');
    const trimmedName = examinerName.trim();
    const trimmedPin = examinerPin.trim().toUpperCase();

    if (!trimmedName) {
      setExaminerAuthError("Please enter the Examiner / Sensei Name.");
      return;
    }

    const validPins = ['EXAM2025', 'LIONS2025', '1234', 'SENSI2025', 'COACH2025'];
    if (!validPins.includes(trimmedPin)) {
      setExaminerAuthError("Invalid Examiner Password. Please enter valid password.");
      return;
    }

    localStorage.setItem('examiner_name', trimmedName);
    localStorage.setItem('examiner_unlocked', 'true');
    setIsExaminerUnlocked(true);
  };

  const handleExaminerLogout = () => {
    localStorage.removeItem('examiner_unlocked');
    setIsExaminerUnlocked(false);
    setSelectedGradingStudent(null);
  };

  // Select student for grading
  const handleSelectGradingStudent = (student: any) => {
    setSelectedGradingStudent(student);
    setGradesInput(student.disciplinesGrades || {});
    setGradeSaveSuccess(false);
    setGradeSaveError('');
  };

  // Grade selection change
  const handleSetGrade = (key: keyof DisciplineGrades, value: GradeValue) => {
    setGradesInput(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save official examiner grades
  const handleSaveExaminerGrades = async () => {
    if (!selectedGradingStudent) return;
    setIsSubmitting(true);
    setGradeSaveError('');
    setGradeSaveSuccess(false);

    try {
      const overallGrade = calculateOverallGrade(gradesInput) || 'A';
      const status = overallGrade === 'F' ? 'failed' : 'passed';
      const examRef = doc(db, 'exams', selectedGradingStudent.id);
      const timestamp = Date.now();

      const updatePayload = {
        disciplinesGrades: gradesInput,
        grade: overallGrade,
        status: status,
        examinerName: examinerName.trim() || 'Sensei Examiner',
        gradedAt: timestamp,
        updatedAt: timestamp
      };

      await updateDoc(examRef, updatePayload);

      // Update local state instantly
      setSelectedGradingStudent(prev => prev ? { ...prev, ...updatePayload } : null);
      setCandidates(prev => prev.map(item => item.id === selectedGradingStudent.id ? { ...item, ...updatePayload } : item));
      setGradeSaveSuccess(true);
      setTimeout(() => setGradeSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Failed to save examiner grades:", err);
      setGradeSaveError("Failed to save grades to cloud server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedOverall = calculateOverallGrade(gradesInput);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-center">
      
      {/* Top Header & Tab Toggle Navigation */}
      <div className="inline-flex items-center space-x-2 bg-[#FF3B3F]/10 border border-[#FF3B3F]/20 px-3 py-1.5 rounded-full mb-3">
        <Sparkles className="w-3.5 h-3.5 text-[#FF3B3F]" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF3B3F]">Belt Examination Hub</span>
      </div>

      <h1 className="font-title text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mb-2 leading-tight">
        Lions Karate Examination
      </h1>
      <p className="text-zinc-500 text-xs max-w-sm mx-auto mb-6">
        Attendance check-in and 7-Discipline scoring portal for Lions Karate Club Pune.
      </p>

      {/* Main Mode Toggle Buttons */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-900 border border-zinc-800 p-1.5 rounded-2xl flex items-center space-x-2 shadow-xl">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-heading text-xs uppercase font-black tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'checkin'
                ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg shadow-rose-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Attendance Check-In</span>
          </button>
          <button
            onClick={() => setActiveTab('grading')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-heading text-xs uppercase font-black tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'grading'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 shadow-lg shadow-yellow-500/20 font-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Examiner Scoring</span>
          </button>
        </div>
      </div>

      {activeTab === 'checkin' ? (
        /* TAB 1: ATTENDANCE CHECK-IN */
        <AnimatePresence mode="wait">
          {!selectedStudent ? (
            <motion.div
              key="search-step"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5 text-left"
            >
              <div className="bg-slate-900 border border-zinc-900 p-5 rounded-2xl space-y-4 shadow-xl">
                <label className="block text-[11px] font-heading font-black uppercase tracking-wider text-zinc-400">
                  Search Student For Attendance
                </label>
                
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Type Student Name or LKCP Roll ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-zinc-800 text-sm font-medium text-white py-3.5 pl-11 pr-4 rounded-xl focus:outline-none focus:border-red-500 placeholder:text-zinc-600 transition-colors"
                  />
                </div>

                {loading ? (
                  <div className="text-center py-6 text-zinc-500 text-xs">
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading candidates roster...</span>
                  </div>
                ) : searchQuery.trim().length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {filteredCandidates.length > 0 ? (
                      filteredCandidates.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectStudent(c)}
                          className="w-full text-left bg-slate-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 p-3.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="space-y-1">
                            <span className="font-heading font-black text-xs text-white block group-hover:text-red-400 transition-colors uppercase">
                              {c.studentName}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-500 block">
                              ID: {c.studentId} • Parent: {c.parentName || 'N/A'}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-heading font-black bg-zinc-900 text-yellow-500 px-2.5 py-1 rounded border border-zinc-800 uppercase block">
                              {c.targetBelt?.split(' (')[0]}
                            </span>
                            {c.checkedIn && (
                              <span className="text-[9px] font-mono font-bold text-emerald-400 mt-1 block">
                                ✓ Present
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-6 border border-dashed border-zinc-850 rounded-xl text-xs text-zinc-500">
                        No matching student found. Please verify spelling or ID.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-zinc-850 rounded-xl text-zinc-500 text-xs">
                    <UserCheck className="w-6 h-6 text-zinc-650 mx-auto mb-2" />
                    <span>Please type student name above to select and check in.</span>
                  </div>
                )}
              </div>

              <button
                onClick={onBackToHome}
                className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-750 text-xs font-heading font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
              >
                Back to Dojo Homepage
              </button>
            </motion.div>
          ) : checkInSuccess ? (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, scale: 0.93, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: -10 }}
              className="space-y-6 text-center"
            >
              <div className="space-y-3 py-4">
                <div className="relative inline-block">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"
                  />
                  <div className="w-20 h-20 bg-emerald-950/80 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-xl relative z-10">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="font-heading font-black text-2xl uppercase tracking-wider text-emerald-400">
                    Attendance Confirmed
                  </h2>
                  <p className="text-zinc-500 text-xs">
                    Today's grading attendance sheet is successfully updated!
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 border border-emerald-950/40 p-6 rounded-2xl text-left relative overflow-hidden shadow-2xl space-y-4">
                <div>
                  <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest font-black block">Registered Student</span>
                  <h3 className="font-heading font-black text-xl text-white uppercase mt-0.5 leading-tight">
                    {selectedStudent.studentName}
                  </h3>
                  <span className="font-mono text-xs text-zinc-400 font-extrabold tracking-wider block mt-0.5">
                    ID: {selectedStudent.studentId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <div className="bg-slate-950 p-3 rounded-xl border border-zinc-850">
                    <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-wider block">Branch</span>
                    <span className="font-heading font-black text-xs text-white block mt-1 truncate">
                      {selectedStudent.branch}
                    </span>
                  </div>
                  {(() => {
                    const beltColors = getBeltColorClasses(selectedStudent.targetBelt);
                    return (
                      <div className={`p-3 rounded-xl border ${beltColors.bg} ${beltColors.border}`}>
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">Target Rank</span>
                        <span className={`font-heading font-black text-xs ${beltColors.text} flex items-center space-x-1.5 mt-1 truncate`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${beltColors.dot}`} />
                          <span>{selectedStudent.targetBelt?.split(' (')[0]}</span>
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="bg-slate-950/80 border border-zinc-900 rounded-xl p-3.5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Auto-redirecting...</span>
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    Roster search in <strong className="text-sm font-black">{countdown}s</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleResetSearch}
                    className="py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-heading font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-98 cursor-pointer text-center"
                  >
                    Roster Search
                  </button>
                  <button
                    onClick={onBackToHome}
                    className="py-3.5 bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-heading font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                  >
                    Homepage
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="details-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-5 text-left"
            >
              <div className="bg-slate-900 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-slate-950 p-4.5 border-b border-zinc-900 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">Student Profile Selected</span>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-zinc-550 hover:text-white text-[10px] font-heading font-black uppercase tracking-widest bg-zinc-900 px-2.5 py-1 rounded transition-colors cursor-pointer"
                  >
                    Change Student
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="font-heading font-black text-xl text-white uppercase leading-tight">
                      {selectedStudent.studentName}
                    </h2>
                    <span className="font-mono text-xs text-yellow-500 font-extrabold tracking-widest block mt-1">
                      ROLL ID: {selectedStudent.studentId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-zinc-850">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Current Rank</span>
                      <span className="text-xs text-white font-heading font-black uppercase tracking-wider block mt-1 truncate">
                        {selectedStudent.currentBelt?.split(' (')[0]}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-zinc-850 border-emerald-950/45">
                      <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest block">Grading Target</span>
                      <span className="text-xs text-emerald-400 font-heading font-black uppercase tracking-wider block mt-1 truncate">
                        {selectedStudent.targetBelt?.split(' (')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {!selectedStudent.checkedIn && (
                  <button
                    onClick={handleConfirmAttendance}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-500 hover:from-rose-600 hover:to-red-600 text-white font-heading font-black uppercase tracking-widest rounded-xl transition-all shadow-lg cursor-pointer text-center text-xs flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <span>Recording Presenti...</span>
                    ) : (
                      <>
                        <UserCheck className="w-4.5 h-4.5 text-white" />
                        <span>Confirm Present & Check-In</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-full py-3 bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 text-[11px] font-heading font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  Go Back to Search
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        /* TAB 2: EXAMINER SCORING & DISCIPLINE GRADING PORTAL */
        <div className="space-y-6 text-left">
          {!isExaminerUnlocked ? (
            /* Examiner Login Gate */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 mx-auto">
                <Lock className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-heading font-black text-lg uppercase text-white tracking-wide">
                  Examiner Login Access
                </h3>
                <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                  Please enter your Examiner / Coach Name and Access Password to evaluate and award 7-Discipline scores.
                </p>
              </div>

              <form onSubmit={handleExaminerLogin} className="space-y-4 max-w-md mx-auto">
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-black uppercase tracking-wider text-zinc-400">
                    Examiner / Sensei Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sensei Shivraj / Sensei Maruti"
                    value={examinerName}
                    onChange={(e) => setExaminerName(e.target.value)}
                    className="w-full bg-slate-950 border border-zinc-800 text-sm font-medium text-white p-3 rounded-xl focus:outline-none focus:border-yellow-500 placeholder:text-zinc-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-black uppercase tracking-wider text-zinc-400">
                    Examiner Access Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter Access Password (e.g. EXAM2025 or 1234)"
                    value={examinerPin}
                    onChange={(e) => setExaminerPin(e.target.value)}
                    className="w-full bg-slate-950 border border-zinc-800 text-sm font-mono text-white p-3 rounded-xl focus:outline-none focus:border-yellow-500 tracking-widest text-center uppercase placeholder:text-zinc-600"
                  />
                </div>

                {examinerAuthError && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-center">
                    {examinerAuthError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-heading font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-yellow-500/20 active:scale-98 cursor-pointer"
                >
                  Unlock Examiner Portal
                </button>
              </form>
            </motion.div>
          ) : (
            /* Examiner Unlocked Workspace */
            <div className="space-y-6">
              {/* Active Examiner Banner */}
              <div className="bg-slate-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-500 font-black text-sm">
                    🥋
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Active Examiner</span>
                    <span className="font-heading font-black text-sm text-white uppercase block">
                      {examinerName || 'Sensei Examiner'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleExaminerLogout}
                  className="text-zinc-500 hover:text-red-400 text-[10px] font-heading font-black uppercase tracking-wider bg-slate-950 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-red-950 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>

              {!selectedGradingStudent ? (
                /* Select Candidate for Scoring */
                <div className="bg-slate-900 border border-zinc-900 p-5 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-heading font-black uppercase tracking-wider text-yellow-500 flex items-center gap-2">
                      <Search className="w-4 h-4 text-yellow-500" />
                      Select Student For 7-Discipline Scoring
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">{candidates.length} Registered Candidates</span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Type Student Name or LKCP Roll ID to grade..."
                      value={gradingSearch}
                      onChange={(e) => setGradingSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-zinc-800 text-sm font-medium text-white py-3.5 pl-11 pr-4 rounded-xl focus:outline-none focus:border-yellow-500 placeholder:text-zinc-600 transition-colors"
                    />
                  </div>

                  {gradingSearch.trim().length > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {filteredGradingCandidates.length > 0 ? (
                        filteredGradingCandidates.map((c) => {
                          const overall = c.grade || calculateOverallGrade(c.disciplinesGrades);
                          return (
                            <button
                              key={c.id}
                              onClick={() => handleSelectGradingStudent(c)}
                              className="w-full text-left bg-slate-950 hover:bg-zinc-900 border border-zinc-850 hover:border-yellow-500/50 p-3.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                            >
                              <div className="space-y-1">
                                <span className="font-heading font-black text-xs text-white block group-hover:text-yellow-400 transition-colors uppercase">
                                  {c.studentName}
                                </span>
                                <span className="font-mono text-[10px] text-zinc-500 block">
                                  ID: {c.studentId} • Branch: {c.branch || 'N/A'}
                                </span>
                              </div>
                              <div className="text-right shrink-0 space-y-1">
                                <span className="text-[10px] font-heading font-black bg-zinc-900 text-zinc-300 px-2.5 py-1 rounded border border-zinc-800 uppercase block">
                                  {c.targetBelt?.split(' (')[0]}
                                </span>
                                {overall ? (
                                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border inline-block ${getGradeBadgeColor(overall)}`}>
                                    Rank: {overall}
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-mono text-zinc-600 block">Not Scored</span>
                                )}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-center py-6 border border-dashed border-zinc-850 rounded-xl text-xs text-zinc-500">
                          No candidate matching query found.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-zinc-850 rounded-xl text-zinc-500 text-xs">
                      <Trophy className="w-6 h-6 text-yellow-500/50 mx-auto mb-2" />
                      <span>Search student name or Roll ID above to begin evaluation.</span>
                    </div>
                  )}
                </div>
              ) : (
                /* 7-Discipline Scoring Interactive Board */
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Selected Candidate Header Info Card */}
                  <div className="bg-slate-900 border border-zinc-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-mono font-bold bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20 uppercase">
                          Candidate Evaluation
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          ID: {selectedGradingStudent.studentId}
                        </span>
                      </div>
                      <h3 className="font-heading font-black text-xl text-white uppercase mt-1">
                        {selectedGradingStudent.studentName}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Branch: <strong>{selectedGradingStudent.branch}</strong> • Target: <strong className="text-yellow-400">{selectedGradingStudent.targetBelt?.split(' (')[0]}</strong>
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      {/* Realtime Calculated Average Badge */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-zinc-800 text-center min-w-28">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Calculated Rank</span>
                        <span className={`text-lg font-heading font-black uppercase block mt-0.5 ${getGradeBadgeColor(calculatedOverall)}`}>
                          {calculatedOverall ? `Grade ${calculatedOverall}` : 'Pending'}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedGradingStudent(null)}
                        className="p-2.5 bg-slate-950 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition-colors cursor-pointer text-xs font-bold"
                        title="Change candidate"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* 7 Discipline Scoring Cards Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-heading font-black uppercase tracking-wider text-zinc-400">
                        7 Karate Disciplines Scorecard
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Grade options: A+, A, B+, B, C, F
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {DISCIPLINES.map((discipline, idx) => {
                        const currentGrade = gradesInput[discipline.key];
                        return (
                          <div
                            key={discipline.key}
                            className={`p-4 rounded-xl border transition-all ${
                              currentGrade
                                ? 'bg-slate-900/90 border-yellow-500/30'
                                : 'bg-slate-900 border-zinc-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{discipline.icon}</span>
                                <div>
                                  <span className="font-heading font-black text-xs text-white uppercase tracking-wider block">
                                    {idx + 1}. {discipline.label}
                                  </span>
                                  <span className="text-[9px] text-zinc-500 font-mono block">
                                    {discipline.desc}
                                  </span>
                                </div>
                              </div>
                              {currentGrade && (
                                <span className={`text-xs font-heading font-black px-2 py-0.5 rounded border uppercase ${getGradeBadgeColor(currentGrade)}`}>
                                  {currentGrade}
                                </span>
                              )}
                            </div>

                            {/* Grade Selector Pill Buttons */}
                            <div className="grid grid-cols-6 gap-1.5 pt-2">
                              {GRADE_OPTIONS.map((gOption) => {
                                const isSelected = currentGrade === gOption;
                                return (
                                  <button
                                    key={gOption}
                                    type="button"
                                    onClick={() => handleSetGrade(discipline.key, gOption)}
                                    className={`py-2 text-xs font-heading font-black rounded-lg border transition-all cursor-pointer text-center ${
                                      isSelected
                                        ? 'bg-yellow-500 text-slate-950 border-yellow-400 font-extrabold shadow-md scale-105'
                                        : 'bg-slate-950 text-zinc-400 border-zinc-850 hover:border-zinc-700 hover:text-white'
                                    }`}
                                  >
                                    {gOption}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Overall Result Preview & Save Action */}
                  <div className="bg-slate-900 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xl">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                      <span>Assigned Examiner:</span>
                      <span className="font-heading font-black text-white uppercase bg-slate-950 px-2.5 py-1 rounded border border-zinc-800">
                        {examinerName}
                      </span>
                    </div>

                    {gradeSaveSuccess && (
                      <div className="bg-emerald-500/15 border border-emerald-500/30 p-3.5 rounded-xl text-center text-xs text-emerald-400 font-heading font-black uppercase tracking-wider flex items-center justify-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Scores Successfully Saved & Synchronized To Certificate!</span>
                      </div>
                    )}

                    {gradeSaveError && (
                      <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-center text-xs text-red-400">
                        {gradeSaveError}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleSaveExaminerGrades}
                        disabled={isSubmitting || !calculatedOverall}
                        className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-heading font-black uppercase tracking-widest text-xs rounded-xl shadow-lg hover:shadow-yellow-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span>Saving Scores...</span>
                        ) : (
                          <>
                            <Trophy className="w-4 h-4 text-slate-950" />
                            <span>Save & Award Official Grades</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedGradingStudent(null)}
                        className="py-4 px-6 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl font-heading font-black uppercase tracking-wider text-xs transition-colors cursor-pointer"
                      >
                        Back to Search
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

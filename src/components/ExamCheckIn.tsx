import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Search, UserCheck, Calendar, ShieldCheck, ArrowLeft, Trophy, MapPin, Sparkles } from 'lucide-react';

interface ExamCheckInProps {
  onBackToHome: () => void;
}

export default function ExamCheckIn({ onBackToHome }: ExamCheckInProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      console.error("Failed to load check-in candidates:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter candidates based on search query
  const filteredCandidates = candidates.filter(c => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false; // Show nothing by default to keep screen clean until they type
    
    const idMatch = (c.studentId || '').toLowerCase().includes(query);
    const nameMatch = (c.studentName || '').toLowerCase().includes(query);
    const parentMatch = (c.parentName || '').toLowerCase().includes(query);
    const phoneMatch = (c.parentPhone || '').toLowerCase().includes(query);

    return idMatch || nameMatch || parentMatch || phoneMatch;
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

      // Update local state to reflect check-in success
      setSelectedStudent(prev => prev ? { ...prev, checkedIn: true, checkInTime: timeString } : null);
      setCheckInSuccess(true);
    } catch (err: any) {
      console.error("Check-in error:", err);
      setErrorMsg("Failed to complete check-in. Please try again or ask sensei.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 text-center">
      {/* Header Badge */}
      <div className="inline-flex items-center space-x-2 bg-[#FF3B3F]/10 border border-[#FF3B3F]/20 px-3 py-1.5 rounded-full mb-4">
        <Sparkles className="w-3.5 h-3.5 text-[#FF3B3F]" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF3B3F]">Belt Exam Attendance Check-In</span>
      </div>

      <h1 className="font-title text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mb-2 leading-tight">
        Dojo Day Check-In
      </h1>
      <p className="text-zinc-500 text-xs max-w-sm mx-auto mb-8">
        Welcome to Lions Karate Club Pune. Quickly mark your student's attendance for today's belt grading exam.
      </p>

      <AnimatePresence mode="wait">
        {!selectedStudent ? (
          <motion.div
            key="search-step"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-5 text-left"
          >
            {/* Search Input Card */}
            <div className="bg-slate-900 border border-zinc-900 p-5 rounded-2xl space-y-4 shadow-xl">
              <label className="block text-[11px] font-heading font-black uppercase tracking-wider text-zinc-400">
                Search Your Student
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
        ) : (
          <motion.div
            key="details-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-5 text-left"
          >
            {/* Confirmation & Status Card */}
            <div className="bg-slate-900 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
              {/* Card Header branding */}
              <div className="bg-slate-950 p-4.5 border-b border-zinc-900 flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">Student Profile Selected</span>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-zinc-550 hover:text-white text-[10px] font-heading font-black uppercase tracking-widest bg-zinc-900 px-2.5 py-1 rounded transition-colors cursor-pointer"
                >
                  Change Student
                </button>
              </div>

              {/* Profile Details */}
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="font-heading font-black text-xl text-white uppercase leading-tight">
                    {selectedStudent.studentName}
                  </h2>
                  <span className="font-mono text-xs text-yellow-500 font-extrabold tracking-widest block mt-1">
                    ROLL ID: {selectedStudent.studentId}
                  </span>
                </div>

                {/* Grid Details */}
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

                <div className="space-y-2.5">
                  <div className="flex items-center space-x-3 text-xs text-zinc-400">
                    <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span><strong>Branch:</strong> {selectedStudent.branch}</span>
                  </div>
                  {selectedStudent.examDate && (
                    <div className="flex items-center space-x-3 text-xs text-zinc-400">
                      <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
                      <span><strong>Exam Day:</strong> {selectedStudent.examDate}</span>
                    </div>
                  )}
                </div>

                {/* Attendance State Indicator */}
                <div className="pt-4 border-t border-zinc-900">
                  {selectedStudent.checkedIn ? (
                    <div className="bg-emerald-950/20 border border-emerald-850/30 p-4 rounded-xl flex items-center space-x-3.5 text-emerald-400">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div className="text-xs">
                        <span className="font-heading font-black uppercase tracking-wider text-white">Checked In & Present!</span>
                        <p className="text-zinc-400 mt-0.5">Confirmed at: <strong>{selectedStudent.checkInTime || 'Just now'}</strong></p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl text-xs text-yellow-600 font-medium">
                      Student is registered but not yet marked present for today's exam.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submitting Actions */}
            <div className="space-y-3">
              {!selectedStudent.checkedIn && (
                <button
                  onClick={handleConfirmAttendance}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-500 hover:from-rose-600 hover:to-red-600 text-white font-heading font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-rose-600/10 active:scale-98 cursor-pointer text-center text-xs flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Recording Presenti...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4.5 h-4.5 text-white" />
                      <span>Confirm Present & Check-In</span>
                    </>
                  )}
                </button>
              )}

              {checkInSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/15 border border-emerald-500/25 p-4 rounded-xl text-center space-y-1"
                >
                  <p className="text-white font-heading font-black uppercase tracking-wider text-xs">✓ Attendance Success!</p>
                  <p className="text-zinc-400 text-[10px]">Student attendance sheet has been synchronized with Dojo administration.</p>
                </motion.div>
              )}

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center text-xs text-red-400">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-750 text-[11px] font-heading font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
              >
                Go Back to Search
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

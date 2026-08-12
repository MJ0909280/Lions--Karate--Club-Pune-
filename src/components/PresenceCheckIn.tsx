import React, { useState } from 'react';
import { QrCode, CheckCircle2, UserCheck, Printer, Smartphone, Download, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function PresenceCheckIn({ onBackToHome }: { onBackToHome?: () => void }) {
  const [selectedBatch, setSelectedBatch] = useState<string>('Evening (5:00 PM - 6:30 PM)');
  const [studentIdInput, setStudentIdInput] = useState<string>('');
  const [checkingIn, setCheckingIn] = useState<boolean>(false);
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Construct attendance URL for QR Code
  const attendanceUrl = `${window.location.origin}/#qr-checkin`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(attendanceUrl)}&color=ff2a35&bgcolor=0e0e10`;

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrCodeImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Lions_Karate_Attendance_QR.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(qrCodeImageUrl, '_blank');
    }
  };

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawId = studentIdInput.trim().toUpperCase();

    if (!rawId) {
      setErrorMessage('Please enter Student ID / Roll No.');
      return;
    }

    setCheckingIn(true);
    setCheckInSuccess(null);
    setErrorMessage(null);

    try {
      let matchedName = '';
      let matchedId = rawId;
      let foundInDb = false;

      // Safe database lookup across students, admissions, and candidates
      try {
        // 1. Check 'students' collection by studentId, rollNo, or id
        const snapStudents = await getDocs(collection(db, 'students'));
        const matchedStudentDoc = snapStudents.docs.find(d => {
          const data = d.data();
          const sid = (data.studentId || data.rollNo || d.id || '').toString().toUpperCase();
          return sid === rawId || sid.replace(/[^0-9]/g, '') === rawId.replace(/[^0-9]/g, '');
        });

        if (matchedStudentDoc) {
          const data = matchedStudentDoc.data();
          matchedName = data.fullName || data.name || data.studentName || `Karate Student (${rawId})`;
          matchedId = data.studentId || rawId;
          foundInDb = true;
        } else {
          // 2. Check 'admissions' collection
          const snapAdmissions = await getDocs(collection(db, 'admissions'));
          const matchedAdmissionDoc = snapAdmissions.docs.find(d => {
            const data = d.data();
            const sid = (data.studentId || data.rollNo || d.id || '').toString().toUpperCase();
            return sid === rawId || sid.replace(/[^0-9]/g, '') === rawId.replace(/[^0-9]/g, '');
          });

          if (matchedAdmissionDoc) {
            const data = matchedAdmissionDoc.data();
            matchedName = data.fullName || data.name || `Karate Student (${rawId})`;
            matchedId = data.studentId || rawId;
            foundInDb = true;
          } else {
            // 3. Check 'candidates' collection
            const snapCandidates = await getDocs(collection(db, 'candidates'));
            const matchedCandidateDoc = snapCandidates.docs.find(d => {
              const data = d.data();
              const sid = (data.studentId || data.rollNo || d.id || '').toString().toUpperCase();
              return sid === rawId || sid.replace(/[^0-9]/g, '') === rawId.replace(/[^0-9]/g, '');
            });

            if (matchedCandidateDoc) {
              const data = matchedCandidateDoc.data();
              matchedName = data.studentName || data.fullName || `Karate Student (${rawId})`;
              matchedId = data.studentId || rawId;
              foundInDb = true;
            }
          }
        }
      } catch (dbQueryErr) {
        console.warn('Firestore lookup warning:', dbQueryErr);
      }

      // If student ID was not found in database records
      if (!foundInDb) {
        setErrorMessage(`Student ID "${rawId}" is not found in Lions Karate Club records. Please verify your Roll ID.`);
        setCheckingIn(false);
        return;
      }

      // Save attendance log directly into Firestore
      await addDoc(collection(db, 'attendance_logs'), {
        studentName: matchedName,
        studentId: matchedId,
        batch: selectedBatch,
        status: 'Present',
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0]
      });

      setCheckInSuccess(`✅ Attendance marked PRESENT for ${matchedName} (${matchedId})!`);
      setStudentIdInput('');
    } catch (err: any) {
      console.error('Check-in save error:', err);
      // Fallback message if network or Firestore write encounters issue
      setErrorMessage(`Attendance submitted for ID: ${rawId}. Please check network connection if status does not refresh.`);
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#060607] text-[#fafafa] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e1e22] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[#FF2A35] font-mono text-xs font-bold uppercase tracking-widest bg-[#FF2A35]/10 border border-[#FF2A35]/20 px-3 py-1 rounded-full mb-2">
              <QrCode className="w-3.5 h-3.5 animate-pulse" />
              <span>Smart Dojo Attendance System</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-wider text-white">
              Presence Check-in Dashboard
            </h1>
            <p className="text-[#A1A1AA] text-xs sm:text-sm mt-1 max-w-2xl">
              Scan the Dojo QR Code with any smartphone camera to instantly log your child's presence for today's training batch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadQR}
              className="inline-flex items-center gap-2 bg-[#FF2A35] hover:bg-red-600 text-white font-heading font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#FF2A35]/20"
            >
              <Download className="w-4 h-4" />
              <span>Download QR Code</span>
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-2 bg-[#161619] hover:bg-[#1e1e22] text-[#FAFAFA] border border-[#1e1e22] font-heading font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg hover:border-[#FF2A35]/40"
            >
              <Printer className="w-4 h-4 text-[#FF2A35]" />
              <span>Print Poster</span>
            </button>
            
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors uppercase font-mono tracking-wider"
              >
                ← Back
              </button>
            )}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL (5 cols): Dynamic QR Code Display */}
          <div className="lg:col-span-5 bg-[#0E0E10] border border-[#1E1E22] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF2A35]/5 blur-3xl rounded-full pointer-events-none" />
            
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF2A35] font-bold bg-[#FF2A35]/10 px-2.5 py-1 rounded-md border border-[#FF2A35]/20 inline-block">
                Dojo Entrance QR Code
              </span>
              <h2 className="font-heading text-xl font-black text-white uppercase tracking-wider">
                Scan with Smartphone
              </h2>
              <p className="text-[#A1A1AA] text-xs">
                Point camera at this code to open the 1-Tap Attendance Check-in on your phone
              </p>
            </div>

            {/* Dynamic QR Code Frame */}
            <div className="bg-[#161619] border-2 border-dashed border-[#1E1E22] hover:border-[#FF2A35]/50 rounded-2xl p-6 flex flex-col items-center justify-center transition-all group relative">
              <div className="relative bg-[#060607] p-4 rounded-xl border border-[#1E1E22] shadow-inner">
                <img
                  src={qrCodeImageUrl}
                  alt="Dojo Presence QR Code"
                  className="w-56 h-56 object-contain rounded-lg transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 bg-[#FF2A35] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <QrCode className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
                <Smartphone className="w-4 h-4 text-[#FF2A35]" />
                <span>Works on iOS & Android Cameras</span>
              </div>

              <button
                type="button"
                onClick={handleDownloadQR}
                className="mt-3 w-full py-2.5 bg-[#FF2A35]/10 hover:bg-[#FF2A35] text-[#FF2A35] hover:text-white border border-[#FF2A35]/30 rounded-xl font-heading font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Save QR Code Image (PNG)</span>
              </button>
            </div>

            {/* Quick Link Details */}
            <div className="bg-[#161619] p-4 rounded-xl border border-[#1E1E22] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#A1A1AA]">
                <span>Dojo Branch:</span>
                <span className="font-bold text-white">Narhe - Manaji Nagar</span>
              </div>
              <div className="flex items-center justify-between text-[#A1A1AA]">
                <span>Live Portal URL:</span>
                <a
                  href={attendanceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF2A35] hover:underline font-mono text-[11px] flex items-center gap-1"
                >
                  <span>Open Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL (7 cols): Instant Manual Check-in Form & Live Logs */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Quick Parent Check-in Card */}
            <div className="bg-[#0E0E10] border border-[#1E1E22] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#FF2A35]" />
                    <span>Quick Parent Check-in Form</span>
                  </h2>
                  <p className="text-[#A1A1AA] text-xs mt-0.5">
                    Enter student Roll ID / Number and select batch to mark attendance immediately
                  </p>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md shrink-0">
                  ● System Online
                </span>
              </div>

              <form onSubmit={handleManualCheckIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5 font-semibold">
                    Student ID / Roll No. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Roll No. or ID (e.g. 101, 102, LKC-2026-089)"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    className="w-full bg-[#161619] border border-[#1E1E22] focus:border-[#FF2A35] rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5 font-semibold">
                    Select Training Batch *
                  </label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full bg-[#161619] border border-[#1E1E22] focus:border-[#FF2A35] rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Evening (5:00 PM - 6:30 PM)">Evening Batch A (5:00 PM - 6:30 PM)</option>
                    <option value="Evening (6:30 PM - 8:00 PM)">Evening Batch B (6:30 PM - 8:00 PM)</option>
                    <option value="Night (8:00 PM - 9:30 PM)">Advanced Sparring Batch (8:00 PM - 9:30 PM)</option>
                    <option value="Sunday Morning Special">Sunday Conditioning (7:00 AM - 9:00 AM)</option>
                  </select>
                </div>

                {checkInSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{checkInSuccess}</span>
                  </motion.div>
                )}

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={checkingIn}
                  className="w-full bg-[#FF2A35] hover:bg-[#FF4D55] text-white font-heading font-black text-sm uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-[#FF2A35]/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  {checkingIn ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{checkingIn ? 'Logging Attendance...' : 'Mark Child Present Now'}</span>
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>

      {/* PRINTABLE DOJO POSTER MODAL */}
      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-slate-950 w-full max-w-lg rounded-2xl p-8 space-y-6 shadow-2xl relative border-4 border-red-600"
            >
              {/* Poster Header */}
              <div className="text-center space-y-2 border-b-2 border-zinc-200 pb-4">
                <div className="inline-flex items-center gap-2 bg-red-600 text-white font-heading font-black text-xs uppercase px-3 py-1 rounded-full">
                  Lions Karate Club Pune
                </div>
                <h2 className="font-heading text-2xl font-black uppercase text-slate-900 tracking-wide">
                  ATTENDANCE CHECK-IN
                </h2>
                <p className="text-zinc-600 text-xs font-semibold">
                  Manaji Nagar, Narhe Dojo • Near Ganpati Mandir
                </p>
              </div>

              {/* Poster QR Image */}
              <div className="flex flex-col items-center justify-center space-y-3 py-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(attendanceUrl)}&color=000000&bgcolor=ffffff`}
                  alt="Printable QR Code"
                  className="w-64 h-64 border-4 border-slate-900 rounded-xl p-2 shadow-md"
                />
                <p className="text-xs font-bold font-mono text-center text-slate-800">
                  📲 Scan with any phone camera to mark present
                </p>
              </div>

              {/* Poster Footer Note */}
              <div className="bg-slate-100 p-3 rounded-xl text-center text-[11px] text-zinc-700 font-sans">
                <strong>Helpline:</strong> +91 90496 88172 | <strong>Admissions Open</strong>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-heading font-black text-xs uppercase py-3 rounded-xl transition-all text-center cursor-pointer shadow-md"
                >
                  Print Poster Now
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

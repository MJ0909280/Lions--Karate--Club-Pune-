import { useEffect, useState } from 'react';
import { Admission } from '../types';
import { Download, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const DEFAULT_STUDENT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23111'><rect width='100' height='100' fill='%231a1a1a'/><circle cx='50' cy='35' r='14' fill='%23c9a96e'/><path d='M50 50 L35 75 L30 73 L42 53 L38 50 L30 55 L28 50 L40 42 Z' fill='%23fff'/><path d='M50 50 L65 80 L72 82 L58 55 L65 48 L75 52 L78 47 L60 40 Z' fill='%23fff'/><path d='M42 45 H58 V49 H42 Z' fill='%239B1B20'/></svg>";

interface IDCardProps {
  admission: Admission;
  showSuccessBanner?: boolean;
  hideDownloadActions?: boolean;
}

export default function IDCard({
  admission,
  showSuccessBanner = false,
  hideDownloadActions = false,
}: IDCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [effectiveBelt, setEffectiveBelt] = useState<string>(admission.beltLevel || 'White Belt');

  useEffect(() => {
    setEffectiveBelt(admission.beltLevel || 'White Belt');

    async function fetchLatestBelt() {
      try {
        if (!admission?.studentId) return;
        const examsQ = query(collection(db, 'exams'), where('studentId', '==', admission.studentId));
        const snap = await getDocs(examsQ);
        if (!snap.empty) {
          const passedExams = snap.docs
            .map((d) => d.data())
            .filter((e) => e.status === 'passed' && e.targetBelt);

          if (passedExams.length > 0) {
            passedExams.sort(
              (a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
            );
            if (passedExams[0].targetBelt) {
              setEffectiveBelt(passedExams[0].targetBelt);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch latest exam belt:', err);
      }
    }

    fetchLatestBelt();
  }, [admission]);

  const qrDataString = `LIONS KARATE CLUB PUNE\nStudent ID: ${admission.studentId}\nName: ${admission.fullName}\nBatch: ${admission.batch}\nBranch: ${admission.branch || 'Manaji Nagar Branch'}`;

  const handleDownloadPNG = () => {
    setDownloading(true);
    const canvas = document.createElement('canvas');
    const scaleFactor = 4;
    canvas.width = 400 * scaleFactor;
    canvas.height = 580 * scaleFactor;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setDownloading(false);
      return;
    }

    ctx.scale(scaleFactor, scaleFactor);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#BAE6FD';
    ctx.fillRect(0, 0, 400, 580);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.strokeRect(0, 0, 400, 580);

    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';

    const drawCard = () => {
      try {
        if (logoImg.complete && logoImg.naturalWidth > 0) {
          ctx.save();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.strokeRect(30, 30, 52, 52);
          ctx.drawImage(logoImg, 30, 30, 52, 52);
          ctx.restore();
        } else {
          ctx.fillStyle = '#000000';
          ctx.fillRect(30, 30, 52, 52);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 30px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('L', 56, 56);
        }
      } catch {
        ctx.fillStyle = '#000000';
        ctx.fillRect(30, 30, 52, 52);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('L', 56, 56);
      }

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#000000';
      ctx.font = '900 11px "Outfit", sans-serif';
      ctx.fillText('LIONS KARATE CLUB PUNE', 94, 52);

      ctx.fillStyle = '#71717a';
      ctx.font = '700 7px "Outfit", sans-serif';
      ctx.fillText('EST. 2023 • MAHARASHTRA', 94, 68);

      const studentImg = new Image();
      studentImg.crossOrigin = 'anonymous';

      studentImg.onload = () => {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(100, 110, 200, 220);

        ctx.save();
        ctx.rect(100, 110, 200, 220);
        ctx.clip();
        ctx.filter = 'grayscale(100%)';
        ctx.drawImage(studentImg, 100, 110, 200, 220);
        ctx.restore();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.font = '900 18px "Space Grotesk", sans-serif';
        ctx.fillText(admission.fullName.toUpperCase(), 200, 365);

        ctx.fillStyle = '#FF3B3F';
        ctx.font = 'bold 11px "Space Grotesk", sans-serif';
        ctx.fillText(effectiveBelt.toUpperCase(), 200, 385);

        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 410);
        ctx.lineTo(360, 410);
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#71717a';
        ctx.font = 'bold 6.5px "Outfit", sans-serif';
        ctx.fillText('STUDENT ID', 45, 420);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px "JetBrains Mono", sans-serif';
        ctx.fillText(admission.studentId, 45, 433);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#71717a';
        ctx.font = 'bold 6.5px "Outfit", sans-serif';
        ctx.fillText('PROGRAM BATCH', 355, 420);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 8.5px "Outfit", sans-serif';
        ctx.fillText(admission.batch, 355, 433);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#71717a';
        ctx.font = 'bold 6.5px "Outfit", sans-serif';
        ctx.fillText('DOJO BRANCH', 45, 450);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 8px "Outfit", sans-serif';
        ctx.fillText((admission.branch || 'Manaji Nagar Branch').toUpperCase(), 45, 461);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#71717a';
        ctx.font = 'bold 6.5px "Outfit", sans-serif';
        ctx.fillText('ASSIGNED COACH', 355, 450);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 8px "Outfit", sans-serif';
        const cleanCoach = (admission.coachName || 'Maruti Sir')
          .split(' Black')[0]
          .split(' black')[0]
          .split(' Sir')[0]
          .split(' Mam')[0]
          .trim();
        ctx.fillText(cleanCoach.toUpperCase(), 355, 461);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#71717a';
        ctx.font = 'bold 6.5px "Outfit", sans-serif';
        ctx.fillText('DATE OF BIRTH', 45, 478);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 8px "Outfit", sans-serif';
        const formattedDob = admission.dob
          ? new Date(admission.dob).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : 'N/A';
        ctx.fillText(formattedDob, 45, 489);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#71717a';
        ctx.font = 'bold 6.5px "Outfit", sans-serif';
        ctx.fillText('FEES STATUS', 355, 478);

        ctx.fillStyle = admission.feesStatus === 'Paid' ? '#065f46' : '#991b1b';
        ctx.font = 'bold 8px "Outfit", sans-serif';
        ctx.fillText((admission.feesStatus || 'Unpaid').toUpperCase(), 355, 489);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#71717a';
        ctx.font = 'bold 6.5px "Outfit", sans-serif';
        ctx.fillText('GUARDIAN DECLARATION', 45, 506);

        ctx.fillStyle = '#065f46';
        ctx.font = 'bold 7px "Outfit", sans-serif';
        ctx.fillText('SIGNED AND POLICIES ACCEPTED', 45, 517);

        if (admission.schoolName) {
          ctx.textAlign = 'right';
          ctx.fillStyle = '#71717a';
          ctx.font = 'bold 6.5px "Outfit", sans-serif';
          ctx.fillText('SCHOOL / INSTITUTION', 355, 506);

          ctx.fillStyle = '#000000';
          ctx.font = 'bold 7.5px "Outfit", sans-serif';
          const cleanSchoolName = admission.schoolName.toUpperCase();
          ctx.fillText(cleanSchoolName.length > 25 ? cleanSchoolName.substring(0, 22) + '...' : cleanSchoolName, 355, 517);
        }

        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        qrImg.onload = () => {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(40, 532, 38, 38);

          ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          ctx.lineWidth = 1;
          ctx.strokeRect(40, 532, 38, 38);

          ctx.drawImage(qrImg, 41, 533, 36, 36);

          ctx.textAlign = 'right';
          ctx.fillStyle = '#000000';
          ctx.font = 'italic bold 9px Georgia, serif';
          ctx.fillText('Chief Instructor Maruti Jadhav', 355, 548);

          ctx.fillStyle = '#71717a';
          ctx.font = '900 5.5px "JetBrains Mono", sans-serif';
          ctx.fillText('LIONS KARATE CLUB PUNE', 355, 560);

          const dataUrl = canvas.toDataURL('image/png');
          const trigger = document.createElement('a');
          trigger.download = `ID-Pass-${admission.studentId}.png`;
          trigger.href = dataUrl;
          trigger.click();
          setDownloading(false);
        };

        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(qrDataString)}`;
      };

      studentImg.onerror = () => {
        if (studentImg.src !== DEFAULT_STUDENT_AVATAR) {
          studentImg.src = DEFAULT_STUDENT_AVATAR;
        }
      };

      studentImg.src = admission.photoUrl || DEFAULT_STUDENT_AVATAR;
    };

    logoImg.onload = drawCard;
    logoImg.onerror = drawCard;
    logoImg.src = 'https://res.cloudinary.com/dlzdagymx/image/upload/q_auto/f_auto/v1781350907/logo_new_bgwsw9.jpg';
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in no-print relative">
      {showSuccessBanner && (
        <div className="bg-[#141211] border border-white/10 rounded-2xl p-6 sm:p-7 text-center shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
          <div className="bg-white/5 text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-extrabold font-mono block mb-2">
            Registration confirmed
          </span>

          <h2 className="font-heading text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">
            Student pass ready
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-md mx-auto">
            {admission.fullName} is registered and the card is ready. Download the ID card below when you need a copy for your records.
          </p>

          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-2 bg-black/30 border border-white/10 px-3 py-2 rounded-lg">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">Student ID</span>
              <span className="text-[10px] font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                {admission.studentId}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center w-full overflow-hidden py-1">
        <motion.div
          id="printable-id-card"
          initial={{ opacity: 0, y: 35, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative bg-[#BAE6FD] text-black p-8 w-[345px] h-[580px] flex flex-col justify-between border-[6px] border-black shadow-2xl z-20 select-none rounded-none scale-[0.85] xs:scale-[0.92] sm:scale-100 origin-center transition-transform"
        >
          <div className="w-full flex justify-between items-start">
            <div className="flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/dlzdagymx/image/upload/q_auto/f_auto/v1781350907/logo_new_bgwsw9.jpg"
                alt="Lions Karate Club Logo"
                className="w-10 h-10 object-contain rounded border border-black/15 bg-white p-0.5 shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('logo-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
                referrerPolicy="no-referrer"
              />
              <div id="logo-fallback" className="hidden w-10 h-10 bg-black items-center justify-center text-white font-black text-lg">
                L
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black leading-none uppercase tracking-tight">LIONS KARATE CLUB PUNE</p>
                <p className="text-[6px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">EST. 2023 • MAHARASHTRA</p>
              </div>
            </div>
            <div className="text-right uppercase">
              <p className="text-[8px] font-black leading-none text-[#FF3B3F]">STUDENT ID</p>
              <p className="text-[9px] font-mono font-bold text-black mt-1">{admission.studentId}</p>
            </div>
          </div>

          <div className="w-40 h-[190px] bg-zinc-100 border-2 border-black mx-auto mt-3 overflow-hidden relative flex items-center justify-center select-none shadow">
            <img
              src={admission.photoUrl || DEFAULT_STUDENT_AVATAR}
              alt="Student Portrait Pass"
              className="w-full h-full object-cover filter grayscale contrast-110"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="text-center mt-2.5">
            <h2 className="text-lg font-black uppercase tracking-tight text-black leading-none mb-0.5">
              {admission.fullName}
            </h2>
            <p className="text-[10px] font-bold text-[#FF3B3F] tracking-widest uppercase mb-3">
              {effectiveBelt}
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-left border-t border-black/15 pt-2 text-xs">
              <div>
                <p className="text-[5.5px] uppercase font-bold text-zinc-500">STATUS BATCH</p>
                <p className="text-[8.5px] font-bold text-black truncate leading-tight">{admission.batch}</p>
              </div>
              <div>
                <p className="text-[5.5px] uppercase font-bold text-zinc-500">VERIFICATION</p>
                <p className="text-[8.5px] font-bold text-black uppercase leading-tight">{admission.status}</p>
              </div>
              <div>
                <p className="text-[5.5px] uppercase font-bold text-zinc-500">DOJO BRANCH</p>
                <p className="text-[8.5px] font-bold text-black truncate leading-tight">{admission.branch || 'Manaji Nagar Branch'}</p>
              </div>
              <div>
                <p className="text-[5.5px] uppercase font-bold text-zinc-500">COACH ASSIGNED</p>
                <p className="text-[8.5px] font-bold text-black truncate leading-tight" title={admission.coachName}>
                  {admission.coachName
                    ? admission.coachName.split(' black')[0].split(' Black')[0].replace(' Sir', '').replace(' Mam', '')
                    : 'Maruti Jadhav'}
                </p>
              </div>
              <div>
                <p className="text-[5.5px] uppercase font-bold text-zinc-500">DATE OF BIRTH</p>
                <p className="text-[8.5px] font-bold text-black leading-tight">
                  {admission.dob
                    ? new Date(admission.dob).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[5.5px] uppercase font-bold text-zinc-500">FEES STATUS</p>
                <span
                  className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded leading-none inline-block ${
                    admission.feesStatus === 'Paid'
                      ? 'bg-emerald-500/20 text-emerald-800'
                      : 'bg-rose-500/20 text-rose-800'
                  }`}
                >
                  {(admission.feesStatus || 'Unpaid').toUpperCase()}
                </span>
              </div>
              {admission.schoolName && (
                <div className="col-span-2 border-t border-black/5 pt-1 mt-0.5">
                  <p className="text-[5.5px] uppercase font-bold text-zinc-500">SCHOOL / INSTITUTION</p>
                  <p className="text-[8.5px] font-bold text-black uppercase truncate leading-tight" title={admission.schoolName}>
                    {admission.schoolName}
                  </p>
                </div>
              )}
              <div className="col-span-2 border-t border-black/5 pt-1 mt-0.5">
                <p className="text-[5.5px] uppercase font-bold text-zinc-500">GUARDIAN DECLARATION STATUS</p>
                <p className="text-[7.5px] font-black text-emerald-800 flex items-center gap-1.5">
                  <span>SIGNED AND POLICIES ACCEPTED</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto w-full flex justify-between items-end border-t border-black/5 pt-2">
            <div className="w-12 h-12 border border-black/10 flex items-center justify-center p-0.5 bg-white shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrDataString)}`}
                alt="Validation QR code"
                className="w-full h-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="italic text-[9px] font-bold font-serif leading-none block mb-0.5 text-black">
                Chief Instructor Maruti Jadhav
              </span>
              <span className="text-[5px] uppercase font-bold font-mono tracking-widest text-zinc-400">
                CHIEF TRAINER & ADMIN
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {!hideDownloadActions && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-zinc-900">
          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 font-heading font-extrabold text-[10px] uppercase tracking-widest bg-[#FF3B3F] hover:bg-rose-500 text-white px-6 py-3.5 rounded-lg transition-all shadow-md hover:shadow-red-500/10 cursor-pointer"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Preparing file...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download ID Card</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

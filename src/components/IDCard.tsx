import { useRef, useState } from 'react';
import { Admission } from '../types';
import { Printer, Download, CheckCircle2 } from 'lucide-react';

interface IDCardProps {
  admission: Admission;
  showSuccessBanner?: boolean;
}

export default function IDCard({ admission, showSuccessBanner = false }: IDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Print function isolates card and triggers native browser prompt
  const handlePrint = () => {
    window.print();
  };

  // Pure-JS High Fidelity Canvas Drawer & PNG Generator (Vertical, Black & White with Red accents)
  const handleDownloadPNG = () => {
    setDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 580;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setDownloading(false);
      return;
    }

    // Happy sky blue background for premium print representation
    ctx.fillStyle = '#BAE6FD';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Thick solid black border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Load logo elements dynamically
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';

    const proceedWithDrawing = () => {
      // Draw header box or custom logo
      try {
        if (logoImg.complete && logoImg.naturalWidth > 0) {
          ctx.save();
          // Precise square frame matching the exact visual style
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.strokeRect(30, 30, 52, 52);
          ctx.drawImage(logoImg, 30, 30, 52, 52);
          ctx.restore();
        } else {
          // Fallback box logo
          ctx.fillStyle = '#000000';
          ctx.fillRect(30, 30, 52, 52);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 30px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('L', 56, 56);
        }
      } catch (err) {
        // Fallback box logo in case of CORS errors
        ctx.fillStyle = '#000000';
        ctx.fillRect(30, 30, 52, 52);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('L', 56, 56);
      }

      // Header descriptions
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#000000';
      ctx.font = '900 11px "Outfit", sans-serif';
      ctx.fillText('LIONS KARATE CLUB PUNE', 94, 52);

      ctx.fillStyle = '#71717a';
      ctx.font = '700 7px "Outfit", sans-serif';
      ctx.fillText('EST. 2023 • MAHARASHTRA', 94, 68);

      // Load student photo dynamically
      const studentImg = new Image();
      studentImg.crossOrigin = 'anonymous';
      studentImg.onload = () => {
        // Draw image border frame 
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(100, 110, 200, 220);

        // Render grayscale portrait with safe clipping
        ctx.save();
        ctx.rect(100, 110, 200, 220);
        ctx.clip();
        ctx.filter = 'grayscale(100%)';
        ctx.drawImage(studentImg, 100, 110, 200, 220);
        ctx.restore();

        // Draw Name tag
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.font = '900 18px "Space Grotesk", sans-serif';
        ctx.fillText(admission.fullName.toUpperCase(), canvas.width / 2, 365);

        // Draw Rank / Belt Level (Vivid Artistic Red)
        ctx.fillStyle = '#FF3B3F';
        ctx.font = 'bold 11px "Space Grotesk", sans-serif';
        ctx.fillText(admission.beltLevel.toUpperCase(), canvas.width / 2, 385);

        // Draw divider line
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 410);
        ctx.lineTo(canvas.width - 40, 410);
        ctx.stroke();

        // Metadata left side: Student ID
        ctx.textAlign = 'left';
        ctx.fillStyle = '#9e9e9e';
        ctx.font = 'bold 7px "Outfit", sans-serif';
        ctx.fillText('STUDENT ID', 45, 422);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px "JetBrains Mono", sans-serif';
        ctx.fillText(admission.studentId, 45, 437);

        // Metadata right side: Active Batch timins
        ctx.textAlign = 'right';
        ctx.fillStyle = '#9e9e9e';
        ctx.font = 'bold 7px "Outfit", sans-serif';
        ctx.fillText('PROGRAM BATCH', canvas.width - 45, 422);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px "Outfit", sans-serif';
        ctx.fillText(admission.batch, canvas.width - 45, 437);

        // Metadata Row 2: Dojo Branch & Dedicated Coach
        ctx.textAlign = 'left';
        ctx.fillStyle = '#9e9e9e';
        ctx.font = 'bold 7px "Outfit", sans-serif';
        ctx.fillText('DOJO BRANCH', 45, 457);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px "Outfit", sans-serif';
        ctx.fillText((admission.branch || 'Manaji Nagar Branch').toUpperCase(), 45, 472);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#9e9e9e';
        ctx.font = 'bold 7px "Outfit", sans-serif';
        ctx.fillText('ASSIGNED COACH', canvas.width - 45, 457);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px "Outfit", sans-serif';
        const cleanCoach = (admission.coachName || 'Maruti Sir').split(' Black')[0].split(' black')[0].split(' Sir')[0].split(' Mam')[0].trim();
        ctx.fillText(cleanCoach.toUpperCase(), canvas.width - 45, 472);

        // QR Code Render on bottom-left, signature on bottom-right
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        qrImg.onload = () => {
          // Draw white card background for scanner
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(40, 497, 50, 50);

          ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          ctx.lineWidth = 1;
          ctx.strokeRect(40, 497, 50, 50);

          ctx.drawImage(qrImg, 42, 499, 46, 46);

          // Instructors digital signature text
          ctx.textAlign = 'right';
          ctx.fillStyle = '#000000';
          ctx.font = 'italic italic bold 10px Georgia, serif';
          ctx.fillText('Sensei M. Jadhav', canvas.width - 45, 520);

          ctx.fillStyle = '#71717a';
          ctx.font = '900 6px "JetBrains Mono", sans-serif';
          ctx.fillText('LIONS KARATE CLUB PUNE', canvas.width - 45, 537);

          // Download PNG file directly
          const dataUrl = canvas.toDataURL('image/png');
          const trigger = document.createElement('a');
          trigger.download = `ID-Pass-${admission.studentId}.png`;
          trigger.href = dataUrl;
          trigger.click();
          setDownloading(false);
        };
        
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(admission.studentId + "|" + admission.fullName)}`;
      };
      
      studentImg.src = admission.photoUrl;
    };

    logoImg.onload = proceedWithDrawing;
    logoImg.onerror = proceedWithDrawing;
    logoImg.src = "https://res.cloudinary.com/dlzdagymx/image/upload/q_auto/f_auto/v1781350907/logo_new_bgwsw9.jpg";
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in no-print">
      {showSuccessBanner && (
        <div className="bg-slate-900 border border-[#FF3B3F]/20 rounded-xl p-6 text-center shadow-lg relative glow-gold">
          <div className="bg-[#FF3B3F] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-black">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tighter mb-2">Registration Submitted!</h2>
          <p className="text-zinc-400 text-xs max-w-md mx-auto mb-2 leading-relaxed">
            Your membership is active and pending standard review. Below is your official student ID pass. Please print it or download the PNG to display at reception.
          </p>
          <div className="inline-block bg-[#FF3B3F]/10 border border-[#FF3B3F]/30 px-3 py-1 rounded text-[10px] font-mono font-bold text-[#FF3B3F] capitalize">
            Status: {admission.status}
          </div>
        </div>
      )}

      {/* Visual representation of Student ID Card - Stylized vertical card layout with happy sky blue background */}
      <div className="flex justify-center w-full overflow-hidden py-1">
        <div 
          id="printable-id-card"
          ref={cardRef}
          className="relative bg-[#BAE6FD] text-black p-8 w-[345px] h-[510px] flex flex-col justify-between border-[6px] border-black shadow-2xl z-20 select-none rounded-none scale-[0.85] xs:scale-[0.92] sm:scale-100 origin-center transition-transform"
        >
        {/* Upper Header Row */}
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
            <div id="logo-fallback" className="hidden w-10 h-10 bg-black items-center justify-center text-white font-black text-lg">L</div>
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

        {/* Photo Frame containing Portrait Grayscale Image */}
        <div className="w-40 h-[190px] bg-zinc-100 border-2 border-black mx-auto mt-4 overflow-hidden relative flex items-center justify-center select-none shadow">
          <img 
            src={admission.photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"} 
            alt="Student Portrait Pass"
            className="w-full h-full object-cover filter grayscale contrast-110"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Dynamic student title metadata */}
        <div className="text-center mt-3">
          <h2 className="text-lg font-black uppercase tracking-tight text-black leading-none mb-1">
            {admission.fullName}
          </h2>
          <p className="text-[10px] font-bold text-[#FF3B3F] tracking-widest uppercase mb-4">
            {admission.beltLevel}
          </p>
          
          {/* Metadata Parameters Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-left border-t border-black/10 pt-2.5 text-xs">
            <div>
              <p className="text-[5.5px] uppercase font-bold text-zinc-400">STATUS BATCH</p>
              <p className="text-[8.5px] font-bold text-black truncate">{admission.batch}</p>
            </div>
            <div>
              <p className="text-[5.5px] uppercase font-bold text-zinc-400">VERIFICATION</p>
              <p className="text-[8.5px] font-bold text-black uppercase">{admission.status}</p>
            </div>
            <div>
              <p className="text-[5.5px] uppercase font-bold text-zinc-400">DOJO BRANCH</p>
              <p className="text-[8.5px] font-bold text-black truncate">{admission.branch || 'Manaji Nagar Branch'}</p>
            </div>
            <div>
              <p className="text-[5.5px] uppercase font-bold text-zinc-400">COACH</p>
              <p className="text-[8.5px] font-bold text-black truncate" title={admission.coachName}>
                {admission.coachName ? admission.coachName.split(' black')[0].split(' Black')[0].replace(' Sir', '').replace(' Mam', '') : 'Maruti Jadhav'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Area with barcode scanner on Left and digital Sensei signature on Right */}
        <div className="mt-auto w-full flex justify-between items-end border-t border-black/5 pt-2">
          <div className="w-12 h-12 border border-black/10 flex items-center justify-center p-0.5 bg-white shadow-sm">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=80&data=${encodeURIComponent(admission.studentId + "|" + admission.fullName)}`}
              alt="Validation QR code"
              className="w-full h-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="italic text-[9px] font-bold font-serif leading-none block mb-0.5 text-black">Maruti Jadhav</span>
            <span className="text-[5px] uppercase font-bold font-mono tracking-widest text-zinc-400">CHIEF TRAINER & ADMIN</span>
          </div>
        </div>
      </div>
    </div>

      {/* Interactive print and download options */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-zinc-900">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 font-heading font-extrabold text-[10px] uppercase tracking-widest border border-zinc-700 hover:border-[#FF3B3F] text-zinc-300 hover:text-white hover:bg-zinc-900 px-6 py-3.5 rounded-lg transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#FF3B3F]" />
          <span>PRINT THE STUDENT PASS</span>
        </button>

        <button
          onClick={handleDownloadPNG}
          disabled={downloading}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 font-heading font-extrabold text-[10px] uppercase tracking-widest bg-[#FF3B3F] hover:bg-rose-500 text-white px-6 py-3.5 rounded-lg transition-all shadow-md hover:shadow-red-500/10 cursor-pointer"
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>DRAFTING PNG FILE...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>DOWNLOAD DESIGNER ID CARD</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

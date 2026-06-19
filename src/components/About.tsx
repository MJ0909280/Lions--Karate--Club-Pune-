import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { ShieldAlert, Volume2, VolumeX, RefreshCw } from 'lucide-react';

export default function About() {
  const [aboutVideoUrl, setAboutVideoUrl] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Synchronize video configuration in real-time from Firestore setting doc
    const unsub = onSnapshot(doc(db, 'settings', 'video'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.aboutVideoUrl) {
          setAboutVideoUrl(data.aboutVideoUrl);
        }
      }
    }, (err) => {
      console.error("Firestore loading error on site settings: ", err);
    });
    return () => unsub();
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const virtues = [
    { title: "🥋 Respect", desc: "Build mutual respect, honor, and deep integrity inside and outside the dojo." },
    { title: "💪 Strength", desc: "Develop physical power, muscle conditioning, stamina, and mental willpower." },
    { title: "🛡️ Self-Defense", desc: "Master elite defensive tactics, fast reflex triggers, and real-world safety protection." },
    { title: "🏆 Excellence", desc: "Strive for perfection of character, competitive podium achievements, and personal growth." },
  ];

  return (
    <section id="about" className="py-20 sm:py-28 bg-[#FAF7F0] border-t border-[#E8E2D5] relative overflow-hidden">
      {/* Decorative vertical background kanji with heritage red watermark on beige */}
      <div className="absolute top-10 left-10 opacity-[0.08] hidden xl:block select-none pointer-events-none text-left">
        <div className="font-kanji text-[10rem] leading-none text-[#9B1B20] font-black tracking-widest writing-vertical">
          禅心
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* LEFT: Video & Rotating Orbits Column - 6 Columns wrapped in a premium charcoal black compartment */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[500px] p-6 sm:p-10 rounded-2xl bg-[#141211] border border-stone-900 select-none overflow-hidden shadow-2xl">
            {/* Spotlight background inside charcoal backplate */}
            <div className="absolute inset-0 bg-radial-gradient from-stone-900/30 via-transparent to-transparent pointer-events-none" />
            
            {/* Spinning Golden Orbits Background inside dark charcoal backplate */}
            <div className="absolute w-[440px] h-[440px] border border-dashed border-[#C9A96E]/12 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none" />
            <div className="absolute w-[360px] h-[360px] border border-dashed border-[#9B1B20]/12 rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none" />
            
            <div className="absolute w-[280px] h-[280px] border border-[#C9A96E]/20 rounded-full flex items-center justify-center animate-[spin_25s_linear_infinite] pointer-events-none">
              <div className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-[#C9A96E]/30" />
              <div className="absolute -bottom-1.5 left-1/2 w-3 h-3 rounded-full bg-[#9B1B20]/35" />
            </div>

            {/* Core Video Player Container */}
            <div className="relative overflow-hidden rounded-xl border-4 border-[#1c1917] bg-black h-[440px] w-full max-w-sm shadow-[0_12px_40px_rgba(0,0,0,0.65)] z-10 group">
              <video
                ref={videoRef}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                key={aboutVideoUrl} // Re-bind node on link adjustments
                className="w-full h-full object-cover object-center filter contrast-[1.05] transition-scale duration-1000 group-hover:scale-103"
              >
                {aboutVideoUrl && <source src={aboutVideoUrl} type="video/mp4" />}
                {/* Primary cloud hosted direct video source supplied by user */}
                <source src="https://res.cloudinary.com/dlzdagymx/video/upload/q_auto/f_auto/v1781891366/WhatsApp_Video_2026-06-19_at_9.51.10_PM_pog0dc.mp4" type="video/mp4" />
                {/* Fallback to standard local pathways if uploaded to the public directory */}
                <source src="/about_video.mp4" type="video/mp4" />
                <source src="/about-video.mp4" type="video/mp4" />
                <source src="/uploaded_video.mp4" type="video/mp4" />
                <source src="/hero.mp4" type="video/mp4" />
                <source src="/video.mp4" type="video/mp4" />
                
                {/* Premium high-quality physical practice training loop fallback */}
                <source src="https://assets.mixkit.co/videos/preview/mixkit-karate-fighter-in-slow-motion-40342-large.mp4" type="video/mp4" />
                <source src="https://assets.mixkit.co/videos/preview/mixkit-woman-practicing-martial-arts-moves-in-the-sunset-40341-large.mp4" type="video/mp4" />
              </video>

              {/* Mute and audio controls overlay */}
              <div className="absolute top-4 right-4 z-20 flex space-x-2">
                <button
                  onClick={toggleMute}
                  className="bg-stone-950/90 hover:bg-stone-900 border border-stone-800 text-stone-300 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase flex items-center space-x-2 transition shadow-lg backdrop-blur-sm cursor-pointer"
                  title={isMuted ? "Unmute sound" : "Mute sound"}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-[10px] tracking-wider font-heading">Sound Off</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span className="text-[10px] tracking-wider font-heading text-emerald-400">Sound On</span>
                    </>
                  )}
                </button>
              </div>

              {/* Informative Label Overlay with Dojo Kun - High contrast floating dark paper card */}
              <div className="absolute bottom-5 left-5 right-5 bg-stone-950/95 backdrop-blur-md p-5 rounded-xl border border-stone-800/40 z-20 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-kanji text-yellow-500 text-sm font-black">道場訓</span>
                  <span className="font-heading text-yellow-500/80 text-[10px] uppercase font-bold tracking-wider">— Dojo Kun (Oath)</span>
                </div>
                <p className="text-stone-300 text-[11px] italic font-body leading-relaxed">
                  "Perfect your character. Train with absolute focus, sincere effort, and respect for all."
                </p>
              </div>
            </div>

            {/* Centered Kanji water banner behind the card - Adjusted positioning to ensure complete visibility */}
            <div className="absolute bottom-4 right-6 z-0 font-kanji text-7xl font-bold text-[#9B1B20]/12 select-none pointer-events-none">
              道場精神
            </div>
          </div>

          {/* RIGHT: Texts & Virtues Column - 6 Columns */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2">
              <div className="h-[1.5px] w-8 bg-[#9B1B20]"></div>
              <span className="text-[#9B1B20] font-heading font-extrabold text-xs uppercase tracking-[0.3em]">Our Heritage</span>
              <div className="h-[1.5px] w-8 bg-[#9B1B20]"></div>
            </div>

            <h2 className="font-heading text-4xl sm:text-6xl font-black text-stone-950 uppercase tracking-tighter leading-none">
              THE WAY OF A <br />
              <span className="text-stone-950 font-kanji font-black">CHAMPION</span>
            </h2>

            <p className="text-[#8B5E1E] font-extrabold text-xs sm:text-sm tracking-wider uppercase font-heading">
              Every belt earned. Every challenge conquered. Every lesson learned.
            </p>

            <p className="text-stone-950 text-xs sm:text-sm leading-relaxed font-body font-medium">
              At LIONS KARATE CLUB PUNE, we blend the rigorous alignment of lineage Shotokan karate with modern fitness science. Students develop the robust posture, physical protection triggers, and mind discipline needed to conquer every obstacle, on and off the mat.
            </p>

            {/* Virtues List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {virtues.map((v, i) => (
                <div key={i} className="flex flex-col bg-white border border-[#E8E2D5] p-5 rounded-xl shadow-[0_6px_20px_rgba(28,25,23,0.05)] hover:shadow-[0_12px_32px_rgba(28,25,23,0.1)] hover:border-[#9B1B20]/40 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center space-x-2 text-[#9B1B20] mb-2">
                    <span className="text-sm select-none">{v.title.split(' ')[0]}</span>
                    <h4 className="font-heading font-black text-stone-950 text-xs uppercase tracking-widest">{v.title.split(' ').slice(1).join(' ')}</h4>
                  </div>
                  <p className="text-stone-900 text-[11.5px] font-medium leading-relaxed font-body">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

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
    <section id="about" className="py-14 sm:py-20 bg-slate-950 border-t border-zinc-900/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Video & Canvas Accent Column */}
          <div className="relative group">
            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-yellow-600 rounded-lg blur opacity-25 group-hover:opacity-35 transition duration-1000 group-hover:duration-200" />
            
            {/* Core Video Player Container */}
            <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-slate-900 h-[480px]">
              <video
                ref={videoRef}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                key={aboutVideoUrl} // Re-bind node on link adjustments
                className="w-full h-full object-cover object-center filter contrast-125 transition-all duration-700"
              >
                {aboutVideoUrl && <source src={aboutVideoUrl} type="video/mp4" />}
                {/* Primary cloud hosted direct video source supplied by user */}
                <source src="https://res.cloudinary.com/dlzdagymx/video/upload/q_auto/f_auto/v1779342942/lions-karate-website-media/m3hfwi7bsfujadlsy5sl.mp4" type="video/mp4" />
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
                  className="bg-slate-950/80 hover:bg-slate-900 border border-zinc-800 text-zinc-300 hover:text-white px-3 py-1.5 rounded-full text-xs font-semibold uppercase flex items-center space-x-1.5 transition shadow-lg backdrop-blur-sm cursor-pointer"
                  title={isMuted ? "Unmute sound" : "Mute sound"}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-4 h-4 text-red-500" />
                      <span>Sound Off</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>Sound On</span>
                    </>
                  )}
                </button>
              </div>

              {/* Informative Label Overlay */}
              <div className="absolute bottom-6 left-6 right-6 bg-slate-950/90 backdrop-blur-md p-6 rounded-md border border-zinc-800/80 z-20">
                <span className="font-title text-yellow-500 text-sm font-bold tracking-wider block uppercase mb-1">Dojo Oath (Dojo Kun)</span>
                <p className="text-zinc-300 text-xs italic font-serif leading-relaxed">
                  "Exert yourself to perfect your character. Be faithful and sincere. Endeavored training builds steel-clad focus and peerless discipline."
                </p>
              </div>
            </div>
          </div>

          {/* Texts & Virtues Column */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2">
              <div className="h-[1px] w-8 bg-[#FF3B3F]"></div>
              <span className="text-[#FF3B3F] uppercase tracking-[0.3em] text-[10px] font-extrabold">THE WAY OF A CHAMPION</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-4 leading-[0.9]">
              THE WAY OF A <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1px #e5e5e5' }}>CHAMPION</span>
            </h2>
            <p className="text-yellow-500 font-bold text-sm sm:text-base tracking-tight mb-2 uppercase font-mono">
              Every belt earned. Every challenge conquered. Every lesson learned.
            </p>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-8">
              At LIONS KARATE CLUB PUNE, students develop the confidence, discipline, and mindset needed to succeed both on and off the mat.
            </p>

            {/* Virtues List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {virtues.map((v, i) => (
                <div key={i} className="flex flex-col bg-slate-900/40 border border-zinc-900/80 p-5 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-500 mb-2">
                    <h4 className="font-heading font-bold text-zinc-150 text-xs uppercase tracking-wider">{v.title}</h4>
                  </div>
                  <p className="text-zinc-400/90 text-[11px] leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

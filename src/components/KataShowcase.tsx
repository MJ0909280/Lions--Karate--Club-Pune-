import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Play, Pause, Volume2, VolumeX, Sparkles, BookOpen, ShieldCheck, Award } from 'lucide-react';

export default function KataShowcase() {
  const [kataVideoUrl, setKataVideoUrl] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Synchronize video configuration in real-time from Firestore setting doc
    const unsub = onSnapshot(doc(db, 'settings', 'video'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.kataVideoUrl) {
          setKataVideoUrl(data.kataVideoUrl);
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

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => console.error(err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const katas = [
    {
      name: "Heian Shodan",
      meaning: "Peaceful Mind, Level 1",
      belt: "Yellow Belt",
      moves: "21 Moves",
      focus: "Basic stances (Zenlutsu-dachi), low blocks, and middle punches."
    },
    {
      name: "Heian Nidan",
      meaning: "Peaceful Mind, Level 2",
      belt: "Orange Belt",
      moves: "26 Moves",
      focus: "Introduction of back stance (Kokutsu-dachi), side kicks, and double-arm blocks."
    },
    {
      name: "Heian Sandan",
      meaning: "Peaceful Mind, Level 3",
      belt: "Green Belt",
      moves: "20 Moves",
      focus: "Elbow strikes, forearm blocks, stance transitions, and close-quarters defense."
    },
    {
      name: "Heian Yondan",
      meaning: "Peaceful Mind, Level 4",
      belt: "Purple Belt",
      moves: "27 Moves",
      focus: "Dynamic hand techniques, x-blocks, high kicks, and knee strikes."
    },
    {
      name: "Heian Godan",
      meaning: "Peaceful Mind, Level 5",
      belt: "Brown Belt (3rd Kyu)",
      moves: "23 Moves",
      focus: "Advanced leaping, crescent kicks, and transitioning between stances fluidly."
    },
    {
      name: "Tekki Shodan",
      meaning: "Iron Horse, Level 1",
      belt: "Brown Belt (1st Kyu)",
      moves: "29 Moves",
      focus: "Performed entirely in horse stance (Kiba-dachi), mastering hip power and side defense."
    }
  ];

  return (
    <div className="space-y-12 py-4">
      
      {/* Upper Grid Layout: Video Player + Beautiful Information panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        
        {/* Left Column: Vertical Student Kata Showcase video (9:16 aspect) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#0C0C0E] border border-zinc-900 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
          
          <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-xl border-4 border-zinc-900 bg-black overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.7)] group">
            <video
              ref={videoRef}
              key={kataVideoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover object-center filter brightness-105 contrast-[1.03] transition-all duration-700"
              src={kataVideoUrl || "https://res.cloudinary.com/dlzdagymx/video/upload/v1784001539/WhatsApp_Video_2026-07-14_at_9.23.13_AM_sve0ia.mp4"}
            />

            {/* Media Action Overlays */}
            <div className="absolute top-4 right-4 z-20 flex space-x-2">
              <button
                onClick={toggleMute}
                className="bg-slate-950/90 hover:bg-slate-900 border border-stone-850 text-stone-300 hover:text-white p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 cursor-pointer"
                title={isMuted ? "Unmute sound" : "Mute sound"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />}
              </button>
            </div>

            <div className="absolute bottom-4 left-4 z-20">
              <button
                onClick={togglePlay}
                className="bg-slate-950/90 hover:bg-slate-900 border border-stone-850 text-stone-300 hover:text-white p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 cursor-pointer"
                title={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
              </button>
            </div>

            {/* Premium floating tag */}
            <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-yellow-500/30 text-yellow-500 font-heading text-[9px] uppercase tracking-wider font-bold">
              • LIVE DRILL LOOP
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 font-body mt-4 text-center">
            Student practicing standard Kata loop. Admin-configurable dynamically in real-time.
          </p>
        </div>

        {/* Right Column: Descriptions & Objectives */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span className="text-yellow-500 font-heading font-extrabold text-xs uppercase tracking-[0.2em]">Form & Precision</span>
            </div>
            
            <h3 className="font-heading text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-tight">
              KATA: THE SOUL OF <br />
              <span className="text-yellow-500 font-kanji font-black">SHOTOKAN KARATE</span>
            </h3>

            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-body font-light">
              Kata (型) translates literally to "form" or "pattern". It is a choreographed sequence of defensive and offensive movements, simulating combat against multiple imaginary opponents. At Lions Karate Club, Kata forms the core pillar of discipline, teaches alignment, breathing mechanics, and refines muscle-memory instincts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0E0E10] border border-zinc-900/80 p-5 rounded-xl hover:border-yellow-500/20 transition-all duration-300">
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <BookOpen className="w-4 h-4" />
                <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">Mindful Discipline</h4>
              </div>
              <p className="text-zinc-400 text-[11.5px] leading-relaxed font-body">
                Kata requires complete, intense focus. Students memorize complex vectors, learning to center their minds and achieve total situational presence.
              </p>
            </div>

            <div className="bg-[#0E0E10] border border-zinc-900/80 p-5 rounded-xl hover:border-yellow-500/20 transition-all duration-300">
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">Combative Application</h4>
              </div>
              <p className="text-zinc-400 text-[11.5px] leading-relaxed font-body">
                Every movement in Kata has a practical application, known as <strong>Bunkai</strong>. Practicing Kata develops reflexes to block and strike on instinct.
              </p>
            </div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl flex items-start gap-3.5">
            <Award className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-heading text-xs font-bold text-white uppercase tracking-wider">Syllabus Requirements</h5>
              <p className="text-zinc-400 text-[11px] leading-relaxed font-body mt-1">
                To progress to higher belt ranks, mastering designated Katas is a mandatory prerequisite during grading examinations.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Lower Section: Shotokan Kata Curriculum Cards */}
      <div className="space-y-6 pt-4 border-t border-zinc-900">
        <div>
          <h4 className="font-heading text-white text-lg font-black uppercase tracking-wider">Core Kata Syllabus</h4>
          <p className="text-zinc-500 text-xs font-body mt-0.5">Explore the official belt requirements and patterns taught under Maruti Sensei.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {katas.map((kata, index) => (
            <div 
              key={index} 
              className="bg-[#0A0A0C] border border-zinc-900/60 p-5 rounded-xl hover:border-yellow-500/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-heading text-white font-black text-sm uppercase tracking-wide">{kata.name}</h5>
                  <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded font-heading uppercase font-bold">
                    {kata.belt}
                  </span>
                </div>
                
                <p className="text-zinc-400 text-[11px] font-medium italic">
                  Meaning: "{kata.meaning}"
                </p>
                
                <p className="text-zinc-450 text-[11px] leading-relaxed font-body pt-1">
                  {kata.focus}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-900/40 mt-4 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
                <span>SHOTOKAN SYLLABUS</span>
                <span className="text-zinc-400 font-semibold">{kata.moves}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

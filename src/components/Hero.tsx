import { useState, useEffect } from 'react';
import { Award, Zap, Users, ArrowRight } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface HeroProps {
  onNavigate: (view: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [videoMounted, setVideoMounted] = useState(false);
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>('');

  useEffect(() => {
    // Listen to real-time hero video custom URL updates
    const unsub = onSnapshot(doc(db, 'settings', 'video'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.heroVideoUrl) {
          setHeroVideoUrl(data.heroVideoUrl);
        }
      }
    }, (err) => {
      console.error("Firestore loading error on background setting: ", err);
    });

    // Lazy load the video for optimal fast initial page compilation and layout paint
    const timer = setTimeout(() => {
      setVideoMounted(true);
    }, 100);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 pt-20">
      {/* Background Video with modern aspect ratio scaling and cropping prevention */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        {/* Layered dark gradients to maximize typography contrast and readability on all screen sizes */}
        <div className="absolute inset-0 bg-slate-950/75 sm:bg-slate-950/65 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/40 z-10" />
        
        {videoMounted && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            webkit-playsinline="true"
            key={heroVideoUrl} // Re-bind node on link adjustments
            className="w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-700 opacity-65"
          >
            {heroVideoUrl && <source src={heroVideoUrl} type="video/mp4" />}
            {/* Primary cloud hosted direct video source supplied by user */}
            <source src="https://res.cloudinary.com/dlzdagymx/video/upload/q_auto/f_auto/v1779342942/lions-karate-website-media/m3hfwi7bsfujadlsy5sl.mp4" type="video/mp4" />
            {/* Direct reference to platform local paths if the user uploaded it to the project folder */}
            <source src="/hero.mp4" type="video/mp4" />
            <source src="/video.mp4" type="video/mp4" />
            <source src="/hero-video.mp4" type="video/mp4" />
            <source src="/hero_video.mp4" type="video/mp4" />
            <source src="hero.mp4" type="video/mp4" />
            <source src="video.mp4" type="video/mp4" />
            
            {/* Premium high-quality Karate training loop video fallback (played in user's browser) */}
            <source src="https://assets.mixkit.co/videos/preview/mixkit-karate-fighter-in-slow-motion-40342-large.mp4" type="video/mp4" />
          </video>
        )}
      </div>

      {/* Decorative Traditional Calligraphy Pattern Overlay */}
      <div className="absolute top-1/4 right-10 z-10 opacity-5 hidden lg:block select-none pointer-events-none text-right">
        <div className="font-title text-[15rem] leading-none text-white font-black tracking-widest writing-vertical">
          空手
        </div>
        <div className="text-zinc-500 text-sm tracking-[0.4em] uppercase font-semibold mt-2 mr-6">
          "Empty Hand" Traditional Way
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-28">
        {/* Top Accent Badge */}
        <div className="inline-flex items-center space-[#FF3B3F] space-x-3 mb-8 animate-fade-in">
          <div className="h-[1px] w-8 sm:w-12 bg-[#FF3B3F]"></div>
          <span className="text-[#FF3B3F] uppercase tracking-[0.25em] text-[10px] sm:text-[11px] font-extrabold font-mono">LIONS KARATE CLUB PUNE • NOBU TRADITION</span>
          <div className="h-[1px] w-8 sm:w-12 bg-[#FF3B3F]"></div>
        </div>

        {/* Big Displays */}
        <h1 className="font-heading text-5xl sm:text-7xl md:text-[110px] font-extrabold uppercase text-white tracking-tighter leading-[0.85] mb-8 select-none">
          THE ART OF<br />
          <span className="text-[#FF3B3F]">DISCIPLINE</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-zinc-300 text-base sm:text-lg md:text-xl font-heading font-light tracking-wide mb-3 leading-relaxed">
          Embark on a path of self-mastery. LIONS KARATE CLUB PUNE delivers premium Shotokan combat and self-defence training for kids, youth, and adults.
        </p>
        <p className="max-w-2xl mx-auto text-yellow-500 text-sm sm:text-base font-heading font-semibold tracking-wider mb-10 uppercase">
          Training at Shrinivas Building, Narhe, Pune
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <button
            onClick={() => onNavigate('admission')}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 font-heading font-extrabold text-sm uppercase tracking-widest bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-8 py-4 rounded shadow-xl hover:shadow-yellow-500/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
          >
            <span>JOIN THE DOJO NOW</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <a
            href="#batches"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 font-heading font-semibold text-sm uppercase tracking-widest bg-transparent hover:bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-8 py-4 rounded transition-all duration-300 transform hover:-translate-y-1"
          >
            <span>EXPLORE BATCHES</span>
          </a>
        </div>

        {/* Association & Affiliation Logos Section */}
        <div className="mb-14 max-w-2xl mx-auto bg-slate-900/40 backdrop-blur-md border border-zinc-900/80 p-4.5 rounded-2xl animate-fade-in shadow-xl">
          <div className="text-[10px] font-heading font-black tracking-[0.2em] text-yellow-500 uppercase mb-4 text-center">
            OFFICIALLY APPROVED STYLE & SHIBU CERTIFICATIONS
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 items-stretch justify-center">
            {/* Logo 1 */}
            <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-zinc-850/50 shadow-md">
              <img 
                src="https://res.cloudinary.com/dlzdagymx/image/upload/q_auto/f_auto/v1781585561/aa604cmh1_tfa8an.webp" 
                alt="Traditional Shotokan Style Logo" 
                className="w-10 h-10 object-contain rounded-lg bg-white p-0.5 border border-zinc-800"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <div className="text-[11px] font-heading font-black text-white leading-tight uppercase">Shotokan Style</div>
                <div className="text-[9px] font-sans text-zinc-500 font-medium">Approved Lineage</div>
              </div>
            </div>

            {/* Logo 2 */}
            <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-zinc-850/50 shadow-md">
              <img 
                src="https://res.cloudinary.com/dlzdagymx/image/upload/q_auto/f_auto/v1781585561/maxresdefault_mrjbrt.jpg" 
                alt="WKF / World Karate Federation Logo" 
                className="w-10 h-10 object-cover rounded-lg bg-slate-950 border border-zinc-850"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <div className="text-[11px] font-heading font-black text-white leading-tight uppercase">WKF Certified</div>
                <div className="text-[9px] font-sans text-zinc-500 font-medium">World Regulation</div>
              </div>
            </div>

            {/* Logo 3 */}
            <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-zinc-850/50 shadow-md">
              <img 
                src="https://res.cloudinary.com/dlzdagymx/image/upload/q_auto/f_auto/v1781585562/logo_new_t7ctxo.jpg" 
                alt="Lions Karate Registered Club Logo" 
                className="w-10 h-10 object-contain rounded-lg bg-white p-0.5 border border-zinc-800"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <div className="text-[11px] font-heading font-black text-white leading-tight uppercase">Registered Club</div>
                <div className="text-[9px] font-sans text-zinc-500 font-medium">National Shibu</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Trinitarian Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 bg-slate-900/60 backdrop-blur-sm border border-zinc-800/60 p-5 rounded-lg text-left shadow-lg">
            <div className="bg-yellow-500/10 p-3 rounded text-yellow-500">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-zinc-200 uppercase text-xs tracking-wider">CHAMPIONSHIP MENTORSHIP</h4>
              <p className="text-zinc-500 text-xs mt-1">Train with physical education masters & black belt champions.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-slate-900/60 backdrop-blur-sm border border-zinc-800/60 p-5 rounded-lg text-left shadow-lg">
            <div className="bg-yellow-500/10 p-3 rounded text-yellow-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-zinc-200 uppercase text-xs tracking-wider">ALL AGE BRACKETS</h4>
              <p className="text-zinc-500 text-xs mt-1">Targeted training batches designed for ages 4 to 60+.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-slate-900/60 backdrop-blur-sm border border-zinc-800/60 p-5 rounded-lg text-left shadow-lg">
            <div className="bg-yellow-500/10 p-3 rounded text-yellow-500">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-zinc-200 uppercase text-xs tracking-wider">AUTHORIZED CERTIFICATES</h4>
              <p className="text-zinc-500 text-xs mt-1">Get authentic belt rank certification recognized internationally.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Extreme bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  );
}

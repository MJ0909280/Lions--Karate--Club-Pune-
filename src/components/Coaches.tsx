import { Award, ShieldAlert, BadgeCheck } from 'lucide-react';
import { CoachInfo } from '../types';

export default function Coaches() {
  const coaches: CoachInfo[] = [
    {
      name: "Sensei Maruti Jadhav",
      rank: "2nd Dan Black Belt",
      role: "Co-Founder & Chief Trainer",
      experience: "National Player & Professional Instructor",
      bio: "Dedicated to developing disciplined, confident, and competition-ready students through professional karate training and self-defense education.",
      image: "https://res.cloudinary.com/dlzdagymx/image/upload/q_auto/f_auto/v1775902315/lions-karate-students/kkp6f9ft8ji6ytxqpm6d.jpg"
    },
    {
      name: "Sensei Shivraj Jejure",
      rank: "2nd Dan Black Belt",
      role: "Founder & Trainer",
      experience: "National Player & Martial Arts Advocate",
      bio: "Passionate about inspiring students through martial arts, character development, discipline, and competitive excellence.",
      image: "https://res.cloudinary.com/dlzdagymx/image/upload/q_auto/f_auto/v1781354493/1000406954.jpg_gak7yh.jpg"
    }
  ];

  return (
    <section id="coaches" className="py-20 sm:py-28 bg-[#111010] border-t border-zinc-900/60 relative overflow-hidden">
      {/* Decorative background kanji */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 opacity-[0.03] hidden xl:block select-none pointer-events-none text-left">
        <div className="font-kanji text-[11rem] leading-none text-red-500 font-extrabold tracking-widest writing-vertical">
          師範
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 justify-center">
            <div className="h-[1px] w-8 bg-red-500"></div>
            <span className="text-red-500 uppercase tracking-[0.3em] text-[10px] font-extrabold font-mono">COACHING MASTERS</span>
            <div className="h-[1px] w-8 bg-red-500"></div>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-4">
            LEGENDARY <span className="text-transparent font-kanji" style={{ WebkitTextStroke: '1px #C9A96E', color: 'transparent' }}>SENSEIS</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans max-w-xl mx-auto leading-relaxed">
            Learn directly from certified masters who live and breathe traditional Shotokan karate martial arts and athletic physical science.
          </p>
        </div>

        {/* Coach Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {coaches.map((c, idx) => (
            <div 
              key={idx} 
              className="group bg-slate-900/25 border border-zinc-900 rounded-xl overflow-hidden transition-all duration-500 hover:border-yellow-500/20 hover:shadow-2xl hover:shadow-black/70"
            >
              <div className="h-[280px] overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
                <img 
                  src={c.image} 
                  alt={c.name}
                  className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Martial Rank Card */}
                <div className="absolute bottom-4 left-4 z-20 flex items-center space-x-1 bg-yellow-500 text-slate-950 font-heading font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded">
                  <BadgeCheck className="w-3 h-3" />
                  <span>{c.rank}</span>
                </div>
              </div>

              {/* Coach details content */}
              <div className="p-6">
                <h3 className="font-title text-lg font-bold text-white mb-1 uppercase tracking-wider group-hover:text-yellow-500 transition-colors">
                  {c.name}
                </h3>
                <span className="text-zinc-400 font-heading text-[10px] tracking-widest uppercase font-semibold block mb-3">
                  {c.role}
                </span>
                
                <p className="text-zinc-500 text-xs leading-relaxed mb-4 font-light">
                  {c.bio}
                </p>

                <div className="pt-4 border-t border-zinc-800/60 leading-none">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Background Experience</span>
                  <span className="text-[11px] font-heading font-medium text-zinc-400 block">{c.experience}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

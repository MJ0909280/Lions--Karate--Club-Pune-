import { Star, Quote, MessageSquareDot } from 'lucide-react';

interface Testimonial {
  text: string;
  author: string;
  role: string;
  rating: number;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      text: "The discipline Aarav learned here is amazing! His focus in school has completely transformed, and he has become so much more respectful and protective of others.",
      author: "Rajesh Kulkarni",
      role: "Parent of Aarav (9, Orange Belt Student)",
      rating: 5
    },
    {
      text: "This is the best karate academy in Pune. The coaches are extremely supportive yet firm. Ananya's confidence and self-defense posture have boosted remarkably!",
      author: "Priya Sharma",
      role: "Parent of Ananya (7, Yellow Belt Student)",
      rating: 5
    },
    {
      text: "LIONS KARATE is superb. My son Kabir is energetic, athletic, and highly disciplined now. He secured a gold medal in the regional Kumite championship!",
      author: "Amit Deshmukh",
      role: "Parent of Kabir (11, Green Belt Student)",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-14 sm:py-20 bg-slate-950 border-t border-zinc-900/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-yellow-500 font-heading text-xs font-bold uppercase tracking-[0.25em] block mb-3">TESTIMONIALS</span>
          <h2 className="font-title text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            DOJO STORIES
          </h2>
          <p className="text-zinc-400 text-sm">
            Read and watch how training at LIONS KARATE develops focus, character, and mental fortitude inside and outside the ring.
          </p>
        </div>

        {/* 2-Column Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Column 1: Parents' Video Testimonial - 5 Columns */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative bg-slate-900 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-zinc-900 bg-slate-900/55 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">PARENT VIDEO TESTIMONIAL</span>
                </div>
                <div className="p-1 px-2.5 bg-yellow-500/10 text-yellow-500 rounded text-[9px] font-heading font-black tracking-wider uppercase">
                  LIONS KARATE
                </div>
              </div>

              {/* Vertical Mobile Video Aspect Feed Container */}
              <div className="relative aspect-[9/16] max-h-[580px] w-full mx-auto bg-black flex items-center justify-center">
                <video
                  src="https://res.cloudinary.com/dlzdagymx/video/upload/q_auto/f_auto/v1781347453/Check_out_the_full_video_to_see_what_parents_think_of_our_program_At_LIONS_KARATE_CLUB_PUNE_l5vhas.mp4"
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover brightness-95"
                />
              </div>

              <div className="p-5 bg-slate-900 border-t border-zinc-900">
                <h4 className="font-heading font-black text-xs text-white uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <MessageSquareDot className="w-4 h-4 text-yellow-500" />
                  How Parents Think of our Dojo
                </h4>
                <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                  Press study play to check out raw, verified feedback directly from parents speaking on student character growth and confidence.
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Written Feed - 7 Columns */}
          <div className="lg:col-span-7 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {testimonials.map((t, idx) => (
                <div 
                  key={idx} 
                  className={`relative bg-slate-900/40 border border-zinc-900/80 rounded-xl p-7 hover:border-yellow-500/10 transition-colors flex flex-col justify-between ${
                    idx === 2 ? 'sm:col-span-2' : ''
                  }`}
                >
                  <div className="absolute top-6 right-6 text-zinc-800">
                    <Quote className="w-8 h-8 rotate-180 opacity-20" />
                  </div>

                  {/* Text content details */}
                  <div className="mb-6">
                    {/* Stars Indicator */}
                    <div className="flex space-x-1 text-yellow-500 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-zinc-350 text-sm italic leading-relaxed font-light">
                      "{t.text}"
                    </p>
                  </div>

                  {/* Author bio specs */}
                  <div className="pt-4 border-t border-zinc-850 inline-flex flex-col">
                    <span className="font-heading font-bold text-zinc-100 uppercase text-xs tracking-wider">
                      {t.author}
                    </span>
                    <span className="text-zinc-500 text-[10px] mt-0.5 font-medium">
                      {t.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

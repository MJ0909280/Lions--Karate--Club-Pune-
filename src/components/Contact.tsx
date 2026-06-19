import { Phone, Mail, Clock } from 'lucide-react';

export default function Contact() {
  const contactDetails = [
    {
      icon: <Phone className="w-5 h-5 text-yellow-500" />,
      title: "Talk To Us",
      val: "+91 90496 88172_admissions",
      clickUrl: "tel:9049688172"
    },
    {
      icon: <Mail className="w-5 h-5 text-yellow-500" />,
      title: "Write An Email",
      val: "lionskaratepune@gmail.com",
      clickUrl: "mailto:lionskaratepune@gmail.com"
    }
  ];

  const operatingHours = [
    { day: "Mon, Wed, Fri", hours: "04:30 PM – 09:30 PM" },
    { day: "Tue, Thu", hours: "05:00 PM – 09:30 PM" },
    { day: "Saturday", hours: "09:00 AM – 03:00 PM" },
    { day: "Sunday", hours: "Closed" }
  ];

  return (
    <section id="contact" className="py-14 sm:py-20 bg-zinc-950 border-t border-zinc-900/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-yellow-500 font-heading text-xs font-bold uppercase tracking-[0.25em] block mb-3">GET IN TOUCH</span>
          <h2 className="font-title text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            START YOUR <span className="gradient-text-gold">JOURNEY</span>
          </h2>
          <p className="text-zinc-400 text-sm">
            Reach out to our administrators or enroll online today. LIONS KARATE CLUB PUNE provides top-tier Shotokan martial arts and self-defense coaching.
          </p>
        </div>

        {/* Info Grid: Redesigned into a balanced centered contact workspace */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
          
          {/* Left Column: Direct channels and descriptions */}
          <div className="bg-slate-900/30 border border-zinc-900/60 p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h3 className="font-title text-lg font-bold text-white uppercase tracking-wider">Contact Channels</h3>
              <p className="text-zinc-500 text-xs leading-relaxed font-sans">
                Whether you have queries regarding children's developmental programs, self-defense packages, belt rank certificates, or tournament coaching under Shihan, we are here to support your child's physical development.
              </p>
            </div>

            {/* Direct buttons/cards */}
            <div className="space-y-4">
              {contactDetails.map((item, id) => (
                <a 
                  key={id}
                  href={item.clickUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-4 bg-zinc-950/40 border border-zinc-900/80 p-4 rounded-xl hover:border-yellow-500/30 hover:bg-zinc-900/40 transition-all cursor-pointer group animate-fade-in"
                >
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-zinc-800 group-hover:text-yellow-400 transition-colors shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-[10px] uppercase text-zinc-500 tracking-wider">
                      {item.title}
                    </h4>
                    <span className="text-zinc-200 text-sm font-semibold mt-0.5 block group-hover:text-yellow-500 transition-colors">
                      {item.val === "+91 90496 88172_admissions" ? "9049688172" : item.val}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right Column: Training periods */}
          <div className="bg-slate-900/30 border border-zinc-900/60 p-6 sm:p-8 rounded-2xl flex flex-col justify-center">
            <div className="flex items-center space-x-2 text-yellow-500 mb-6">
              <Clock className="w-5 h-5" />
              <h3 className="font-title text-lg font-bold text-white uppercase tracking-wider">TRAINING PERIODS</h3>
            </div>
            
            <p className="text-zinc-500 text-xs leading-relaxed font-sans mb-6">
              Please note our scheduling framework. Selected program batches are available at dedicated times throughout the week.
            </p>

            <div className="space-y-3">
              {operatingHours.map((oh, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-2.5 border-b border-zinc-900 font-sans">
                  <span className="font-medium text-zinc-300">{oh.day}</span>
                  <span className="font-mono text-zinc-500 bg-zinc-950/60 border border-zinc-900/80 px-2.5 py-1 rounded">
                    {oh.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { Phone, Mail, Clock, ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Contact() {
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

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
      val: "LIONSKARATECLUBPUNE09@gmail.com",
      clickUrl: "mailto:LIONSKARATECLUBPUNE09@gmail.com"
    }
  ];

  const operatingHours = [
    { day: "Mon, Wed, Fri", hours: "04:30 PM – 09:30 PM" },
    { day: "Tue, Thu", hours: "05:00 PM – 09:30 PM" },
    { day: "Saturday", hours: "09:00 AM – 03:00 PM" },
    { day: "Sunday", hours: "Closed" }
  ];

  const faqs = [
    {
      q: "What age can children start training at Lions Karate Club Pune?",
      a: "We accept children starting from 4 years of age. Our training curriculum is specifically tailored into age-appropriate, safe, and exciting modules to build active focus, concentration, physical stamina, and confidence."
    },
    {
      q: "Is martial arts training safe for young boys and girls?",
      a: "Absolute physical safety is our core mandate. We utilize official protective gear, safe high-density tatami training mats, and conduct all drills under the close supervision of internationally certified Black Belt Senseis."
    },
    {
      q: "Where are your offline dojo branches in Pune?",
      a: "Our main operational dojo locations are situated in Narhe (near Bhumkar Chowk, beside Silver Birch Hospital), Katraj/Duttanagar, and Jambulwadi Lake View. We serve parents and students from across Pune's prime residential hubs."
    },
    {
      q: "Do you provide WKF approved belt certifications?",
      a: "Yes, indeed. Lions Karate Club Pune is affiliated with national and international standard karate associations. All belt promotion examinations, ranks, and certificates conform strictly to World Karate Federation (WKF) and traditional Shotokan guidelines."
    },
    {
      q: "Can parents watch classes or attend trial drills?",
      a: "Yes, we encourage parents to attend and witness their children's focus, discipline, and coordination growth first-hand. We have dedicated seating spaces at all our offline dojo branches."
    }
  ];

  // Inject structured FAQPage JSON-LD dynamic markup for search crawler and LLMs
  useEffect(() => {
    const schemaId = 'json-ld-faq-page';
    let scriptElement = document.getElementById(schemaId) as HTMLScriptElement;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = schemaId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    };

    scriptElement.textContent = JSON.stringify(faqSchema);

    return () => {
      // Dynamic updates handle overwrite cleanly
    };
  }, []);

  return (
    <section id="contact" className="py-14 sm:py-20 bg-zinc-950 border-t border-zinc-900/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-yellow-500 font-heading text-xs font-bold uppercase tracking-[0.25em] block mb-3 font-mono">GET IN TOUCH</span>
          <h2 className="font-title text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            START YOUR <span className="gradient-text-gold">JOURNEY</span>
          </h2>
          <p className="text-zinc-400 text-sm font-sans">
            Reach out to our administrators or enroll online today. LIONS KARATE CLUB PUNE provides top-tier Shotokan martial arts and self-defense coaching.
          </p>
        </div>

        {/* Info Grid: Center contact workspace */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4 mb-16">
          
          {/* Left Column: Direct channels and descriptions */}
          <div className="bg-[#0f0e0f] border border-zinc-900 p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h3 className="font-title text-base sm:text-lg font-extrabold text-white uppercase tracking-wider">Contact Channels</h3>
              <p className="text-zinc-550 text-xs leading-relaxed font-sans">
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
                  className="flex items-center space-x-4 bg-zinc-950/50 border border-zinc-900 p-4 rounded-xl hover:border-yellow-500/30 hover:bg-zinc-900/40 transition-all cursor-pointer group"
                >
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-zinc-800 group-hover:text-yellow-400 transition-colors shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-heading font-black text-[10px] uppercase text-zinc-500 tracking-wider">
                      {item.title}
                    </h4>
                    <span className="text-zinc-200 text-xs sm:text-sm font-semibold mt-0.5 block group-hover:text-yellow-500 transition-colors break-all">
                      {item.val === "+91 90496 88172_admissions" ? "9049688172" : item.val}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right Column: Training periods */}
          <div className="bg-[#0f0e0f] border border-zinc-900 p-6 sm:p-8 rounded-2xl flex flex-col justify-center">
            <div className="flex items-center space-x-2 text-yellow-500 mb-6">
              <Clock className="w-5 h-5 animate-pulse" />
              <h3 className="font-title text-base sm:text-lg font-extrabold text-white uppercase tracking-wider">TRAINING PERIODS</h3>
            </div>
            
            <p className="text-zinc-550 text-xs leading-relaxed font-sans mb-6">
              Please note our scheduling framework. Selected program batches are available at dedicated times throughout the week.
            </p>

            <div className="space-y-3">
              {operatingHours.map((oh, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-2.5 border-b border-zinc-900/85 font-sans">
                  <span className="font-medium text-zinc-350">{oh.day}</span>
                  <span className="font-mono text-zinc-400 bg-zinc-950/80 border border-zinc-900/80 px-2.5 py-1 rounded">
                    {oh.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ============ NEW SEO & AI SEARCH ACCORDION SECTION ============ */}
        <div className="max-w-3xl mx-auto border-t border-zinc-900/80 pt-16" id="faq-section">
          <div className="text-center mb-10">
            <div className="flex justify-center items-center gap-1.5 text-yellow-500 text-xs font-bold uppercase tracking-widest font-mono mb-2">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Dojo FAQ & Answers</span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
              Common Parental Concerns
            </h3>
            <p className="text-zinc-500 text-xs mt-1.5 max-w-md mx-auto">
              Snappy information parsed and ready for direct access by search crawlers and parent inquiries.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqId === index;
              return (
                <div 
                  key={index}
                  className="bg-[#0f0e0f] border border-zinc-900 rounded-xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4.5 text-left font-heading text-xs sm:text-sm font-bold text-zinc-200 hover:text-yellow-500 select-none cursor-pointer group"
                    id={`faq-btn-${index}`}
                  >
                    <span className="pr-4 leading-normal">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 450, damping: 18 }}
                      className="shrink-0 bg-zinc-950 p-1.5 rounded-lg border border-zinc-900 group-hover:border-yellow-500/20 text-zinc-500 group-hover:text-yellow-500"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ 
                          height: { type: "spring", stiffness: 400, damping: 22, mass: 0.8 },
                          opacity: { duration: 0.2 }
                        }}
                      >
                        <div className="p-4.5 pt-0 text-zinc-400 text-xs sm:text-[13px] leading-relaxed font-sans border-t border-zinc-900/50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

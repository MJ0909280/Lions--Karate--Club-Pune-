import { useState, useEffect } from 'react';
import { Menu, X, ShieldAlert, Award, Calendar, Users, Phone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentView: string;
  studentPortalTab?: 'progress' | 'exam';
  onNavigate: (view: string) => void;
}

export default function Navbar({ currentView, studentPortalTab, onNavigate }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'About', href: '#about', view: 'home' },
    { name: 'Training Batches', href: '#batches', view: 'home' },
    { name: 'Coaches', href: '#coaches', view: 'home' },
    { name: 'Gallery', href: '#gallery', view: 'home' },
    { name: 'Contact Us', href: '#contact', view: 'home' },
  ];

  const handleItemClick = (href: string, view: string) => {
    setIsOpen(false);
    onNavigate(view);
    if (view === 'home' && href.startsWith('#')) {
      setTimeout(() => {
        const element = document.getElementById(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || currentView !== 'home'
          ? 'bg-slate-950/95 backdrop-blur-md py-4 border-b border-yellow-500/10 shadow-lg shadow-black/50'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Brand */}
          <div
            onClick={() => handleItemClick('#', 'home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <img 
              src="https://res.cloudinary.com/dlzdagymx/image/upload/q_auto/f_auto/v1781350907/logo_new_bgwsw9.jpg"
              alt="Lions Karate Club Pune Logo" 
              className="w-11 h-11 object-contain rounded-full border border-yellow-500/50 bg-slate-900 transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-yellow-500/10"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-heading text-xl text-white font-black tracking-tighter uppercase block leading-none">
                LIONS <span className="text-[#FF3B3F]">KARATE</span>
              </span>
              <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-[0.2em] font-bold block leading-none mt-1">
                LIONS KARATE CLUB PUNE
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentView === 'home' &&
              menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleItemClick(item.href, item.view)}
                  className="font-heading text-sm text-zinc-300 hover:text-yellow-500 hover:scale-105 active:scale-95 transition-all uppercase tracking-wide cursor-pointer py-1"
                >
                  {item.name}
                </button>
              ))}

            {currentView !== 'home' && (
              <button
                onClick={() => onNavigate('home')}
                className="font-heading text-sm text-zinc-300 hover:text-yellow-500 hover:scale-105 transition-all uppercase tracking-wide cursor-pointer"
              >
                Back to Website
              </button>
            )}

            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center space-x-1.5 font-heading text-xs uppercase tracking-wider px-3 py-1.5 rounded border transition-all ${
                currentView === 'admin'
                  ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 font-extrabold'
                  : 'border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-550'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>

            <button
              onClick={() => onNavigate('student-portal')}
              className={`flex items-center space-x-1 font-heading text-[11px] uppercase tracking-wider px-2.5 py-1.5 rounded border transition-all ${
                currentView === 'student-portal' && studentPortalTab === 'progress'
                  ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 font-extrabold'
                  : 'border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-yellow-500" />
              <span>Check Results</span>
            </button>

            <button
              onClick={() => onNavigate('belt-exam')}
              className={`flex items-center space-x-1 font-heading text-[11px] uppercase tracking-wider px-2.5 py-1.5 rounded border transition-all ${
                currentView === 'student-portal' && studentPortalTab === 'exam'
                  ? 'bg-red-500/10 border-[#FF3B3F] text-red-500 font-extrabold'
                  : 'border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#FF3B3F]" />
              <span>Apply For Exam</span>
            </button>

            <button
              onClick={() => onNavigate('admission')}
              className="font-heading font-bold text-xs uppercase tracking-widest bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-5 py-2.5 rounded shadow-lg shadow-yellow-500/15 cursor-pointer transform hover:-translate-y-0.5 transition-all text-center"
            >
              ONLINE ADMISSION
            </button>
          </div>

          {/* Mobile hamburger menu toggle with increased accessibility & custom morph indicator */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={() => onNavigate('admin')}
              aria-label="Admin Portal"
              className={`p-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors ${
                currentView === 'admin'
                  ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                  : 'border-zinc-855 bg-slate-900/40 text-zinc-405 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            <button
              id="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-controls="mobile-navigation-menu"
              className="p-2.5 rounded-lg text-zinc-400 hover:text-yellow-500 hover:bg-slate-900 border border-zinc-850 transition-colors cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center justify-center w-10 h-10"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isOpen ? 'close' : 'menu'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18 }}
                  className="w-6 h-6 flex items-center justify-center shrink-0"
                >
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Flyout Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay for depth and easy exit */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-out Drawer Panel Container */}
            <motion.div
              id="mobile-navigation-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-45 w-[300px] sm:w-[340px] bg-slate-950 border-l border-zinc-900/80 p-6 pt-24 shadow-2xl flex flex-col md:hidden"
            >
              {/* Decorative brand design bar */}
              <div className="absolute top-0 right-0 w-[3px] h-full bg-[#FF3B3F]" />
              
              <div className="flex flex-col space-y-6 flex-grow overflow-y-auto">
                {currentView === 'home' && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.25em] font-black block mb-4 border-b border-zinc-900 pb-2">
                      NAVIGATION SECTIONS
                    </span>
                    {menuItems.map((item, index) => (
                      <motion.button
                        key={item.name}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => handleItemClick(item.href, item.view)}
                        className="w-full text-left font-heading text-xs font-bold uppercase py-3 tracking-wider px-3 rounded-lg flex items-center justify-between group cursor-pointer transition-all text-zinc-300 hover:text-yellow-500 hover:bg-slate-900/60"
                      >
                        <span>{item.name}</span>
                        <span className="text-zinc-700 group-hover:text-yellow-500 transition-colors font-mono text-sm">&rarr;</span>
                      </motion.button>
                    ))}
                  </div>
                )}

                {currentView !== 'home' && (
                  <motion.button
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                      setIsOpen(false);
                      onNavigate('home');
                    }}
                    className="w-full text-left font-heading text-xs font-bold text-zinc-350 hover:text-yellow-500 uppercase py-3.5 tracking-wider px-3 rounded-lg hover:bg-slate-900/60 flex items-center justify-between group cursor-pointer border border-zinc-900/40"
                  >
                    <span>Back to Website</span>
                    <span className="text-zinc-650 font-mono text-xs">&rarr;</span>
                  </motion.button>
                )}

                {/* Bottom interactive elements / buttons */}
                <div className="mt-auto space-y-4 border-t border-zinc-900/80 pt-6">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.25em] font-bold block mb-2">
                    BEGIN YOUR JOURNEY
                  </span>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 }}
                    onClick={() => {
                      setIsOpen(false);
                      onNavigate('student-portal');
                    }}
                    className={`w-full font-heading font-black text-xs uppercase tracking-widest py-3 px-4 rounded-xl text-center shadow-lg block cursor-pointer transition-all hover:scale-[1.01] ${
                      currentView === 'student-portal' && studentPortalTab === 'progress'
                        ? 'bg-yellow-500 text-slate-950 border border-yellow-500'
                        : 'bg-slate-900 border border-zinc-800 text-white hover:bg-slate-850'
                    }`}
                  >
                    🥋 CHECK PROGRESS & RESULTS
                  </motion.button>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.20 }}
                    onClick={() => {
                      setIsOpen(false);
                      onNavigate('belt-exam');
                    }}
                    className={`w-full font-heading font-black text-xs uppercase tracking-widest py-3 px-4 rounded-xl text-center shadow-lg block cursor-pointer transition-all hover:scale-[1.01] ${
                      currentView === 'student-portal' && studentPortalTab === 'exam'
                        ? 'bg-[#FF3B3F] text-white border border-[#FF3B3F]'
                        : 'bg-slate-900 border border-zinc-800 text-zinc-350 hover:bg-slate-850'
                    }`}
                  >
                    📝 APPLY FOR BELT EXAM
                  </motion.button>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    onClick={() => {
                      setIsOpen(false);
                      onNavigate('admission');
                    }}
                    className="w-full font-heading font-black text-xs uppercase tracking-widest bg-yellow-500 hover:bg-yellow-400 text-slate-950 py-3.5 px-4 rounded-xl text-center shadow-lg shadow-yellow-500/10 block cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    ONLINE ADMISSION
                  </motion.button>

                  <div className="text-center pt-3">
                    <span className="font-mono text-[8px] text-zinc-500 uppercase block leading-none font-bold">LIONS KARATE CLUB PUNE</span>
                    <span className="font-sans text-[9px] text-zinc-600 block mt-1.5 leading-none">Courage • Respect • Discipline</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TrailerOverlayProps {
  onEnter: () => void;
}

export default function TrailerOverlay({ onEnter }: TrailerOverlayProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particles animation inside the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      wobble: number;
      life: number;
      age: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial fill
    for (let i = 0; i < 65; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 1,
        speed: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.2,
        wobble: Math.random() * 1.5 - 0.75,
        life: Math.random() * 300 + 200,
        age: Math.random() * 200,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, idx) => {
        p.y -= p.speed;
        p.x += Math.sin(p.age * 0.03) * p.wobble;
        p.age += 1;

        if (p.age > p.life || p.y < -30) {
          particles[idx] = {
            x: Math.random() * canvas.width,
            y: canvas.height + 20,
            size: Math.random() * 2.5 + 1,
            speed: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.7 + 0.2,
            wobble: Math.random() * 1.5 - 0.75,
            life: Math.random() * 300 + 200,
            age: 0,
          };
        }

        // Draw embers
        const alpha = p.opacity * (1 - p.age / p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 120, 50, ${alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(155, 27, 32, ${alpha * 0.35})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setTimeout(() => {
      onEnter();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[10000] bg-black select-none overflow-hidden flex flex-col items-center justify-center cursor-pointer"
          onClick={handleDismiss}
        >
          {/* Radial Gradient Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1a0000_0%,#000000_75%)] pointer-events-none" />

          {/* Canvas Component */}
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />

          {/* Core Branding Elements */}
          <div className="relative z-10 text-center flex flex-col items-center gap-6 max-w-xl px-6 pointer-events-auto">
            {/* Massive Kanji characters in background style */}
            <motion.div 
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="font-kanji font-bold text-7xl sm:text-9xl tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-b from-[#e0c78a] via-[#9B1B20] to-[#6a0000] select-none leading-none filter drop-shadow-[0_0_40px_rgba(155,27,32,0.4)]"
            >
              武道
            </motion.div>

            {/* Subtitle */}
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 1.2 }}
              className="font-heading text-xl sm:text-3xl text-[#F0E6D3] uppercase tracking-[0.25em] leading-tight"
            >
              Lions Karate Club Pune
            </motion.h1>

            {/* Expandable Golden Lines */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 240 }}
              transition={{ delay: 1, duration: 1.5 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent"
            />

            {/* Traditional slogan */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4, duration: 1 }}
              className="font-body text-sm sm:text-base italic text-[#8a7040] tracking-widest uppercase font-medium leading-normal"
            >
              — 精神一到 • COURAGE & HONOR —
            </motion.div>

            {/* Main Interactive Action CTA Button */}
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.8, duration: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="mt-6 font-heading font-normal text-xs sm:text-sm tracking-[0.3em] uppercase bg-transparent hover:bg-[#C9A96E]/10 border border-[#C9A96E] hover:border-[#e0c78a] hover:shadow-[0_0_30px_rgba(201,169,110,0.4)] text-[#C9A96E] hover:text-[#e0c78a] py-3.5 px-10 rounded-none transition-all cursor-pointer relative overflow-hidden group"
            >
              <span className="relative z-10">ENTER THE DOJO</span>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#9B1B20] transition-all group-hover:width-[80%]" />
            </motion.button>
          </div>

          {/* Hints indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 2.2, duration: 1 }}
            className="absolute bottom-10 z-10 font-mono text-[9px] uppercase tracking-[0.3em] text-[#8a7040]"
          >
            Click or tap anywhere
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React, { useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'rose' | 'amber' | 'emerald' | 'sky';
}

export const Card3DTilt: React.FC<Card3DTiltProps> = ({
  children,
  className = '',
  glowColor = 'rose'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for tilt angles
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Springs for smooth physics movement
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), {
    stiffness: 300,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), {
    stiffness: 300,
    damping: 25,
  });

  // Dynamic light glare position
  const shineX = useTransform(x, [-0.5, 0.5], [0, 100]);
  const shineY = useTransform(y, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const glowStyles = {
    rose: 'hover:border-rose-500/50 hover:shadow-rose-500/20',
    amber: 'hover:border-amber-500/50 hover:shadow-amber-500/20',
    emerald: 'hover:border-emerald-500/50 hover:shadow-emerald-500/20',
    sky: 'hover:border-sky-500/50 hover:shadow-sky-500/20',
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-3xl transition-all duration-200 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl hover:shadow-2xl ${glowStyles[glowColor]} ${className}`}
    >
      {/* Specular Light Glare overlay */}
      {isHovered && (
        <motion.div
          style={{
            background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.15), transparent 70%)`,
          }}
          className="absolute inset-0 rounded-3xl pointer-events-none z-20"
        />
      )}

      {/* Card Content with 3D Depth transform */}
      <div style={{ transform: 'translateZ(25px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </motion.div>
  );
};

import React, { useEffect, useRef } from 'react';

interface Spark {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  maxOpacity: number;
  fadeSpeed: number;
  color: string;
  sparkleSize: number;
  angle: number;
  angularVelocity: number;
}

export const LightSparksCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color palette matching Sky Blue, Cyan, Emerald
    const sparkColors = [
      'rgba(56, 189, 248, ',  // Sky Blue
      'rgba(6, 182, 212, ',   // Cyan
      'rgba(16, 185, 129, ',  // Emerald Green
      'rgba(255, 255, 255, ',  // Diamond White
    ];

    const sparkCount = 35;
    const sparks: Spark[] = [];

    const createSpark = (): Spark => {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -0.1 - Math.random() * 0.5,
        opacity: Math.random() * 0.15,
        maxOpacity: 0.15 + Math.random() * 0.15,
        fadeSpeed: 0.002 + Math.random() * 0.005,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        sparkleSize: 3 + Math.random() * 8,
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.015,
      };
    };

    for (let i = 0; i < sparkCount; i++) {
      sparks.push(createSpark());
    }

    // Draw twinkling 4-point star burst spark
    const drawStarSpark = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
      opacity: number,
      colorPrefix: string,
      angle: number
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Glow halo
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius * 2);
      gradient.addColorStop(0, colorPrefix + opacity + ')');
      gradient.addColorStop(0.5, colorPrefix + opacity * 0.4 + ')');
      gradient.addColorStop(1, colorPrefix + '0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, outerRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // 4-point light spark cross
      ctx.strokeStyle = colorPrefix + opacity + ')';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(-outerRadius * 1.5, 0);
      ctx.lineTo(outerRadius * 1.5, 0);
      ctx.moveTo(0, -outerRadius * 1.5);
      ctx.lineTo(0, outerRadius * 1.5);
      ctx.stroke();

      // Inner white core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, outerRadius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      sparks.forEach((spark) => {
        spark.x += spark.speedX;
        spark.y += spark.speedY;
        spark.angle += spark.angularVelocity;

        // Pulse opacity
        spark.opacity += spark.fadeSpeed;
        if (spark.opacity >= spark.maxOpacity || spark.opacity <= 0.05) {
          spark.fadeSpeed = -spark.fadeSpeed;
        }

        // Reset if off screen
        if (spark.y < -20 || spark.x < -20 || spark.x > width + 20) {
          spark.x = Math.random() * width;
          spark.y = height + 10;
          spark.opacity = 0.1;
        }

        drawStarSpark(
          ctx,
          spark.x,
          spark.y,
          4,
          spark.sparkleSize,
          spark.sparkleSize * 0.4,
          spark.opacity,
          spark.color,
          spark.angle
        );
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden opacity-30"
    />
  );
};

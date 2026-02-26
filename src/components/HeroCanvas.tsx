import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export const HeroCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Create particles across full screen
      particlesRef.current = [];
      const particleCount = Math.floor((width * height) / 14286); // 30% reduced density
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          size: Math.random() * 2 + 1,
          color: 'hsl(210, 100%, 50%)'
        });
      }
    };

    const updateParticle = (p: Particle, width: number, height: number, mouseX: number | null, mouseY: number | null) => {
      p.x += p.vx;
      p.y += p.vy;

      // Gentle mouse interaction
      if (mouseX !== null && mouseY !== null) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
          const force = (150 - distance) / 150;
          p.vx -= (dx / distance) * force * 0.2;
          p.vy -= (dy / distance) * force * 0.2;
        }
      }

      // Boundary checks with smooth bounce
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Keep particles within bounds
      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));

      // Gentle damping
      p.vx *= 0.995;
      p.vy *= 0.995;
    };

    const drawParticle = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    };

    const drawConnections = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `hsla(210, 100%, 50%, ${1 - distance / 120})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
    };


    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      // Update and draw particles
      particles.forEach(p => {
        updateParticle(p, width, height, mouseX, mouseY);
        drawParticle(ctx, p);
      });

      // Draw connections between particles
      drawConnections(ctx, particles);

      animationRef.current = requestAnimationFrame(animate);
    };

    initCanvas();
    animate();

    const handleResize = () => {
      initCanvas();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section id="hero" className="relative w-full h-screen overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      
      <div className="relative z-10 h-full flex items-center justify-center pointer-events-none">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-accent/10 rounded-full animate-fade-in backdrop-blur-sm">
            <span className="text-accent font-medium text-sm">차세대 학습</span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              틴틴AI로봇아카데미
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in backdrop-blur-sm">
            다가오는 Physical AI의 미래.<br className="hidden md:block" />
            당신의 코드가 현실의 움직임이 되는 과정을 경험하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in pointer-events-auto">
            <Button size="lg" className="group hover-scale" asChild>
              <a href="#curriculum">
                여정 시작하기
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

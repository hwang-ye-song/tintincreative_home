import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

interface Segment {
  length: number;
  angle: number;
}

class RobotArm {
  baseX: number;
  baseY: number;
  segments: Segment[];
  time: number;

  constructor(x: number, y: number) {
    this.baseX = x;
    this.baseY = y;
    this.segments = [
      { length: 120, angle: -Math.PI / 2 },
      { length: 100, angle: -Math.PI / 4 },
      { length: 60, angle: -Math.PI / 2 }
    ];
    this.time = 0;
  }

  update(mouseX: number | null, mouseY: number | null, width: number) {
    this.time += 0.02;
    
    if (mouseX !== null && mouseY !== null && mouseX > width * 0.5) {
      // Mouse tracking
      const dx = mouseX - this.baseX;
      const dy = mouseY - this.baseY;
      this.segments[0].angle = Math.atan2(dy, dx) * 0.5 - 1.5;
      this.segments[1].angle = Math.sin(this.time) * 0.5 + 1;
      this.segments[2].angle = Math.cos(this.time) * 0.5 + 1;
    } else {
      // Idle wave animation
      this.segments[0].angle = -Math.PI / 2 + Math.sin(this.time * 0.5) * 0.2;
      this.segments[1].angle = 0.5 + Math.cos(this.time * 0.5) * 0.3;
      this.segments[2].angle = -Math.PI / 2 + Math.sin(this.time * 0.7) * 0.15;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let currentX = this.baseX;
    let currentY = this.baseY;
    let currentAngle = 0;

    // Draw base
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.beginPath();
    ctx.arc(this.baseX, this.baseY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Draw segments
    this.segments.forEach((segment, index) => {
      currentAngle += segment.angle;
      const endX = currentX + Math.cos(currentAngle) * segment.length;
      const endY = currentY + Math.sin(currentAngle) * segment.length;

      ctx.beginPath();
      ctx.moveTo(currentX, currentY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Draw joint
      ctx.fillStyle = 'hsl(var(--accent))';
      ctx.beginPath();
      ctx.arc(endX, endY, 6, 0, Math.PI * 2);
      ctx.fill();

      currentX = endX;
      currentY = endY;
    });

    // Draw claw
    const clawSize = 15;
    ctx.fillStyle = 'hsl(var(--accent))';
    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(currentX + clawSize, currentY - clawSize);
    ctx.lineTo(currentX + clawSize, currentY + clawSize);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

export const HeroCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const robotArmRef = useRef<RobotArm | null>(null);
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

      // Create particles
      particlesRef.current = [];
      const particleCount = Math.floor((width * height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * (width * 0.6),
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1,
          size: Math.random() * 2 + 1,
          color: 'hsl(var(--primary))'
        });
      }

      // Create robot arm
      robotArmRef.current = new RobotArm(width * 0.75, height * 0.6);
    };

    const updateParticle = (p: Particle, width: number, height: number, mouseX: number | null, mouseY: number | null) => {
      p.x += p.vx;
      p.y += p.vy;

      // Mouse interaction
      if (mouseX !== null && mouseY !== null) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          const force = (100 - distance) / 100;
          p.vx -= (dx / distance) * force * 0.5;
          p.vy -= (dy / distance) * force * 0.5;
        }
      }

      // Boundary checks
      if (p.x < 0 || p.x > width * 0.6) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;
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
            ctx.strokeStyle = `hsla(var(--primary), ${1 - distance / 120})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
    };

    const drawRobotConnections = (ctx: CanvasRenderingContext2D, particles: Particle[], robotX: number, robotY: number) => {
      particles.forEach(p => {
        const dx = robotX - p.x;
        const dy = robotY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 300) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(robotX, robotY);
          ctx.strokeStyle = `hsla(var(--accent), ${(1 - distance / 300) * 0.2})`;
          ctx.lineWidth = 0.3;
          ctx.stroke();
        }
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

      // Update and draw robot arm
      if (robotArmRef.current) {
        robotArmRef.current.update(mouseX, mouseY, width);
        drawRobotConnections(ctx, particles, robotArmRef.current.baseX, robotArmRef.current.baseY);
        robotArmRef.current.draw(ctx);
      }

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
            <span className="block mb-2">AI의 두뇌와</span>
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              로봇의 신체를 연결하다
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in backdrop-blur-sm">
            젠슨황이 예견한 Embodied AI의 미래.<br className="hidden md:block" />
            당신의 코드가 현실의 움직임이 되는 과정을 경험하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in pointer-events-auto">
            <Button size="lg" className="group hover-scale" asChild>
              <a href="#curriculum">
                여정 시작하기
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Link to="/curriculum/basic">
              <Button size="lg" variant="outline" className="hover-scale backdrop-blur-sm">
                커리큘럼 탐색
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

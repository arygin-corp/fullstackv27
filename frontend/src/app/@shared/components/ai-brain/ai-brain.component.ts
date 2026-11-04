import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-ai-brain',
  templateUrl: './ai-brain.component.html',
  styleUrls: ['./ai-brain.component.scss']
})
export class AiBrainComponent implements AfterViewInit, OnDestroy {
  @ViewChild('loaderCanvas') loaderCanvas!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private size = 96;
  private center = { x: this.size / 2, y: this.size / 2 };
  private frame = 0;
  private animationId!: number;
  private typingInterval!: any;
  
  private g1!: CanvasGradient;
  private g2!: CanvasGradient;
  private g3!: CanvasGradient;
  private g4!: CanvasGradient;
  
  private majorStars: Star[] = [];
  private satelliteStars: Star[] = [];
  private cometParticles: CometParticle[] = [];
  
  typingText = "LOADING...";
  displayText = "";
  private charIndex = 0;
  private isDeleting = false;

  private readonly svgPathString = "M55.632 62.732C58.0967 61.6602 60.0232 59.6371 60.9733 57.123L80.0526 6.63797C83.2951 -1.94181 95.4319 -1.94183 98.6744 6.63796L117.754 57.123C118.704 59.6371 120.63 61.6602 123.095 62.732L171.946 83.9769C179.925 87.4467 179.925 98.7626 171.946 102.232L123.095 123.477C120.63 124.549 118.704 126.572 117.754 129.086L98.6744 179.571C95.4319 188.151 83.2951 188.151 80.0526 179.571L60.9733 129.086C60.0232 126.572 58.0967 124.549 55.632 123.477L6.78091 102.232C-1.1978 98.7626 -1.19781 87.4467 6.7809 83.9769L55.632 62.732Z";

  ngAfterViewInit(): void {
    this.initCanvas();
    this.initStars();
    this.startAnimation();
    this.startTypingEffect();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    clearTimeout(this.typingInterval);
  }

  private initCanvas(): void {
    const canvas = this.loaderCanvas.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = this.size * dpr;
    canvas.height = this.size * dpr;
    
    this.ctx = canvas.getContext('2d')!;
    this.ctx.scale(dpr, dpr);
    
    canvas.style.width = `${this.size}px`;
    canvas.style.height = `${this.size}px`;

    this.g1 = this.ctx.createLinearGradient(0, 0, this.size, this.size);
    this.g1.addColorStop(0.1886, '#348CFF');
    this.g1.addColorStop(0.8114, '#1EECB2');

    this.g2 = this.ctx.createLinearGradient(0, this.size, this.size, 0);
    this.g2.addColorStop(0, '#2F63C5');
    this.g2.addColorStop(0.5428, '#2882FA');

    this.g3 = this.ctx.createLinearGradient(0, 0, this.size, 0);
    this.g3.addColorStop(0, '#2F63C5');
    this.g3.addColorStop(0.8168, '#2882FA');

    this.g4 = this.ctx.createLinearGradient(0, 0, this.size, this.size);
    this.g4.addColorStop(0.1886, '#28A2B1');
    this.g4.addColorStop(0.8114, '#1EECB2');
  }

  private initStars(): void {
    this.majorStars = [];
    this.satelliteStars = [];
    this.cometParticles = [];

    const starLayout: StarConfig[] = [
      { type: 'major', originX: this.center.x - 10, originY: this.center.y + 5, baseScale: 0.07, color: this.g1 },
      { type: 'major', originX: this.center.x + 5, originY: this.center.y - 3, baseScale: 0.09, color: this.g2 },
      { type: 'satellite', pathRadius: 20, pathDirection: 1, baseScale: 0.04, color: this.g4 },
      { type: 'satellite', pathRadius: 25, pathDirection: -1, baseScale: 0.03, color: this.g3 },
    ];

    starLayout.forEach(config => {
      const star = new Star(config);
      if (config.type === 'major') {
        this.majorStars.push(star);
      } else {
        this.satelliteStars.push(star);
      }
    });
  }

  private startAnimation(): void {
    const animate = () => {
      this.frame++;
      this.ctx.clearRect(0, 0, this.size, this.size);

      this.cometParticles = this.cometParticles.filter(p => {
        p.update(this.ctx, this.svgPathString);
        return p.life > 0;
      });

      const orbitCenterX = (this.majorStars[0].x + this.majorStars[1].x) / 2;
      const orbitCenterY = (this.majorStars[0].y + this.majorStars[1].y) / 2;

      const allStars = [...this.majorStars, ...this.satelliteStars];
      allStars.sort((a, b) => a.y - b.y);

      allStars.forEach(star => {
        const oldX = star.x;
        const oldY = star.y;

        if (star.config.type === 'satellite') {
          const progress = Math.sin(this.frame * star.orbitSpeed + star.pulseOffset);
          const pathX = star.config.pathRadius! * progress * star.config.pathDirection!;
          const pathY = star.config.pathRadius! * progress;
          star.x = orbitCenterX + pathX;
          star.y = orbitCenterY + pathY;

          if (this.frame % 5 === 0) {
            star.movementAngle = Math.atan2(star.y - oldY, star.x - oldX);
            this.cometParticles.push(new CometParticle(star));
          }
        } else {
          star.x = star.config.originX! + Math.cos(this.frame * star.hoverSpeed + star.pulseOffset) * star.hoverRadius;
          star.y = star.config.originY! + Math.sin(this.frame * star.hoverSpeed + star.pulseOffset) * star.hoverRadius;
        }

        const perspective = star.config.type === 'satellite' 
          ? Math.sin(this.frame * star.orbitSpeed + star.pulseOffset) 
          : 1;
        const scale3D = star.config.type === 'satellite' ? (Math.abs(perspective) * 0.5 + 0.5) : 1;
        const pulse = Math.sin(this.frame * 0.02 + star.pulseOffset) * 0.02;
        star.currentScale = (star.config.baseScale + pulse) * scale3D;
        const opacity = scale3D * 0.7 + 0.3;

        this.drawStar(star.x, star.y, star.currentScale, star.config.color, 0, opacity);
      });

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  private drawStar(cx: number, cy: number, scale: number, color: CanvasGradient, rotation = 0, opacity = 1): void {
    const starPath = new Path2D(this.svgPathString);
    
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.translate(cx, cy);
    this.ctx.rotate(rotation);
    this.ctx.scale(scale, scale);
    this.ctx.translate(-89.36, -93.1);
    
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    this.ctx.shadowBlur = 10 * scale;
    this.ctx.fillStyle = color;
    this.ctx.fill(starPath);
    this.ctx.restore();
  }

  private startTypingEffect(): void {
    const typeEffect = () => {
      this.displayText = this.typingText.substring(0, this.charIndex);
      
      if (!this.isDeleting) {
        this.charIndex++;
        if (this.charIndex > this.typingText.length) {
          this.isDeleting = true;
          this.typingInterval = setTimeout(typeEffect, 2000);
        } else {
          this.typingInterval = setTimeout(typeEffect, 150);
        }
      } else {
        this.charIndex--;
        if (this.charIndex < 0) {
          this.isDeleting = false;
          this.charIndex = 0;
          this.typingInterval = setTimeout(typeEffect, 500);
        } else {
          this.typingInterval = setTimeout(typeEffect, 100);
        }
      }
    };

    typeEffect();
  }
}

interface StarConfig {
  type: 'major' | 'satellite';
  originX?: number;
  originY?: number;
  baseScale: number;
  color: CanvasGradient;
  pathRadius?: number;
  pathDirection?: number;
}

class Star {
  x: number;
  y: number;
  currentScale!: number;
  movementAngle = 0;
  pulseOffset = Math.random() * Math.PI * 2;
  orbitSpeed: number;
  hoverRadius: number;
  hoverSpeed: number;

  constructor(public config: StarConfig) {
    this.x = config.originX || 0;
    this.y = config.originY || 0;
    this.orbitSpeed = 0.015 + Math.random() * 0.005;
    this.hoverRadius = 2;
    this.hoverSpeed = 0.005 + Math.random() * 0.005;
  }
}

class CometParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  life: number;
  maxLife: number;
  color: CanvasGradient;

  constructor(private parentStar: Star) {
    this.x = parentStar.x;
    this.y = parentStar.y;
    const angle = parentStar.movementAngle + Math.PI;
    const spread = Math.PI / 2;
    const finalAngle = angle + (Math.random() - 0.5) * spread;
    const speed = Math.random() * 1.5 + 0.5;
    this.vx = Math.cos(finalAngle) * speed;
    this.vy = Math.sin(finalAngle) * speed;
    this.scale = parentStar.currentScale * (Math.random() * 0.2 + 0.1);
    this.life = 70;
    this.maxLife = 70;
    this.color = parentStar.config.color;
  }

  update(ctx: CanvasRenderingContext2D, svgPathString: string): void {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.life--;
    
    const progress = this.life / this.maxLife;
    const scale = this.scale * progress;
    
    const starPath = new Path2D(svgPathString);
    ctx.save();
    ctx.globalAlpha = progress;
    ctx.translate(this.x, this.y);
    ctx.scale(scale, scale);
    ctx.translate(-89.36, -93.1);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10 * scale;
    ctx.fillStyle = this.color;
    ctx.fill(starPath);
    ctx.restore();
  }
}
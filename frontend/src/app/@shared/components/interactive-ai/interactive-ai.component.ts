import {
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import * as THREE from 'three';

export interface OrbState {
  isActive: boolean;
  intensity: number;
  scale: number;
}

@Component({
  selector: 'app-interactive-ai',
  templateUrl: './interactive-ai.component.html',
  styleUrls: ['./interactive-ai.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InteractiveAiComponent implements OnInit, OnDestroy {
  @Input() state: 'enter' | 'exit' = 'enter';
  @Input() statusText = 'Thinking';
  isActive = false;
  
  /* =====================================================
   * Inputs / Outputs
   * ===================================================== */

  @Input() orbSize: number = 0.7;
  @Input() autoRotate: boolean = true;

  @Output() orbClick = new EventEmitter<void>();
  @Output() finished = new EventEmitter<void>();

  /* =====================================================
   * DOM Reference (SAFE WITH *ngIf)
   * ===================================================== */

  @ViewChild('canvasContainer')
  set canvas(el: ElementRef<HTMLDivElement>) {
    if (!el) return;

    // Prevent double initialization
    if (this.renderer) return;

    this.canvasContainer = el;
    this.initThreeJS();
    this.animate();
  }

  private canvasContainer!: ElementRef<HTMLDivElement>;

  /* =====================================================
   * UI / Status State
   * ===================================================== */

  public statuses: string[] = ['Ready'];
  public currentStatusIndex: number = 0;
  private targetIntensity = 1.2;
  private statusIntervalId: number | null = null;

  /* =====================================================
   * Three.js Core Objects
   * ===================================================== */

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private orbCore!: THREE.Mesh;
  private orbGlow!: THREE.Mesh;

  private clock = new THREE.Clock();
  private animationId: number | null = null;
  private activationTimeoutId: number | null = null; 

  ngOnInit(): void {
    // Existing activation delay
    this.activationTimeoutId = window.setTimeout(() => {
      this.isActive = true;
      this.targetIntensity = 2.0;
    }, 1000);

    // ✅ Status rotation every second
    this.statusIntervalId = window.setInterval(() => {
      this.nextStatus();
    }, 3000);
  }

  constructor(private cdr: ChangeDetectorRef) {}



  ngOnDestroy(): void {
    if (this.activationTimeoutId !== null) {
      clearTimeout(this.activationTimeoutId);
    }

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    window.removeEventListener('resize', this.resizeHandler);

    if (this.orbCore) {
      this.orbCore.geometry.dispose();
      (this.orbCore.material as THREE.ShaderMaterial).dispose();
    }

    if (this.orbGlow) {
      this.orbGlow.geometry.dispose();
      (this.orbGlow.material as THREE.ShaderMaterial).dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.statusIntervalId !== null) {
      clearInterval(this.statusIntervalId);
      this.statusIntervalId = null;
    }
  }

  /* =====================================================
   * Shader Uniforms
   * ===================================================== */

  private coreUniforms = {
    uTime: { value: 0 },
    uScale: { value: 1 }
  };

  private glowUniforms = {
    uTime: { value: 0 },
    uScale: { value: 1 },
    uIntensity: { value: 1.2 }
  };

  /* =====================================================
   * Resize Handler (stable reference)
   * ===================================================== */

  private resizeHandler = () => this.onResize();

  /* =====================================================
   * Three.js Initialization
   * ===================================================== */

  private initThreeJS(): void {
    if (!this.canvasContainer?.nativeElement) return;

    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 3;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    const geometry = new THREE.SphereGeometry(1, 128, 128);

    const coreMat = new THREE.ShaderMaterial({
      uniforms: this.coreUniforms,
      vertexShader: this.getCoreVertexShader(),
      fragmentShader: this.getCoreFragmentShader()
    });

    this.orbCore = new THREE.Mesh(geometry, coreMat);
    this.orbCore.scale.set(this.orbSize, this.orbSize, this.orbSize);
    this.scene.add(this.orbCore);

    const glowMat = new THREE.ShaderMaterial({
      uniforms: this.glowUniforms,
      vertexShader: this.getCoreVertexShader(),
      fragmentShader: this.getGlowFragmentShader(),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    this.orbGlow = new THREE.Mesh(geometry, glowMat);
    this.orbGlow.scale.set(
      this.orbSize * 1.1,
      this.orbSize * 1.1,
      this.orbSize * 1.1
    );
    this.scene.add(this.orbGlow);

    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(0, 0, 2);
    this.scene.add(light);

    window.addEventListener('resize', this.resizeHandler);
  }

  /* =====================================================
   * Animation Loop
   * ===================================================== */

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    const t = this.clock.getElapsedTime();

    const base = Math.sin(t * 8) * 0.15 + 0.85;
    const detail = Math.sin(t * 16) * 0.05;
    const activity = this.isActive ? (base + detail) * 1.5 : base + detail;

    this.coreUniforms.uTime.value = t;
    this.coreUniforms.uScale.value = activity;

    this.glowUniforms.uTime.value = t;
    this.glowUniforms.uScale.value = activity;
    this.glowUniforms.uIntensity.value = activity * this.targetIntensity;

    if (this.autoRotate) {
      this.orbCore.rotation.y = t * 0.2;
      this.orbCore.rotation.z = t * 0.1;
      this.orbGlow.rotation.y = t * 0.2;
      this.orbGlow.rotation.z = t * 0.1;
    }

    this.renderer.render(this.scene, this.camera);
  }

  /* =====================================================
   * Resize Handling
   * ===================================================== */

  private onResize(): void {
    if (!this.renderer || !this.camera) return;

    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /* =====================================================
   * Orb Interaction
   * ===================================================== */

  activate(): void {
    this.isActive = true;
    this.targetIntensity = 2.0;
  }

  deactivate(): void {
    this.isActive = false;
    this.targetIntensity = 1.2;
  }

  toggle(): void {
    this.isActive ? this.deactivate() : this.activate();
    this.orbClick.emit();
  }

  /* =====================================================
   * Status Helpers
   * ===================================================== */

  get currentStatus(): string {
    return this.statuses[this.currentStatusIndex];
  }

  nextStatus(): void {
    this.currentStatusIndex =
      (this.currentStatusIndex + 1) % this.statuses.length;

    this.currentStatus === 'Thinking'
      ? this.deactivate()
      : this.activate();

    // ✅ Force OnPush component to re-render
    this.cdr.markForCheck();
  }


  /* =====================================================
   * Shaders
   * ===================================================== */

  private getCoreVertexShader(): string {
    return `
      uniform float uTime, uScale;
      varying vec3 vPos;
      void main() {
        vPos = position;
        float wave =
          sin(position.x * 5.0 + uTime * 3.0) * 0.02 +
          sin(position.y * 6.0 + uTime * 4.0) * 0.02 +
          sin(position.z * 7.0 + uTime * 2.5) * 0.02;
        vec3 pos = position * (1.0 + wave * uScale);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;
  }

  private getCoreFragmentShader(): string {
    return `
      uniform float uTime;
      varying vec3 vPos;
      void main() {
        vec3 darkPurple = vec3(0.4, 0.1, 0.6);
        vec3 brightPurple = vec3(0.4, 0.3, 0.9);
        float t = sin(vPos.x * 2.0 + uTime * 2.0) * 0.5 + 0.5;
        vec3 color = mix(darkPurple, brightPurple, t);
        gl_FragColor = vec4(color, 1.0);
      }
    `;
  }

  private getGlowFragmentShader(): string {
    return `
      uniform float uTime, uIntensity;
      varying vec3 vPos;
      void main() {
        float rim =
          pow(1.0 - abs(dot(normalize(vPos), vec3(0.0, 0.0, 1.0))), 2.5);
        vec3 glowBase = vec3(0.3, 0.2, 0.8);
        vec3 glow = glowBase * rim * uIntensity;
        gl_FragColor = vec4(glow, rim * 0.7);
      }
    `;
  }
}
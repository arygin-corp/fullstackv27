import { Component, ElementRef, NgZone, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-interactive-ai',
  template: '<div #rendererContainer class="orb-container"></div>',
  styles: [`
    .orb-container {
      width: 100%;
      height: 150px; /* Adjust height as needed */
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      background: transparent;
    }
    canvas { display: block; }
  `]
})
export class InteractiveAiComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private orbCore!: THREE.Mesh;
  private orbGlow!: THREE.Mesh;
  private clock = new THREE.Clock();
  private animationId!: number;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initThree();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
    this.scene.clear();
  }

  private initThree(): void {
    const width = this.rendererContainer.nativeElement.clientWidth;
    const height = this.rendererContainer.nativeElement.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 3;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    const geometry = new THREE.SphereGeometry(1, 128, 128);

    const vertexShader = `
      uniform float uTime, uScale;
      varying vec3 vPos;
      void main() {
        vPos = position;
        float wave = sin(position.x*5. + uTime*3.)*0.02
                   + sin(position.y*6. + uTime*4.)*0.02
                   + sin(position.z*7. + uTime*2.5)*0.02;
        vec3 pos = position * (1.0 + wave * uScale);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.);
      }
    `;

    // 1. Core Orb Material (Use darker and brighter cyans for depth)
    const coreMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uScale: { value: 1 } },
      vertexShader,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vPos;
        void main() {
          // BASE COLORS BASED ON #00FFFF
          vec3 darkCyan = vec3(0.0, 0.4, 0.5);   // Darker variant
          vec3 brightCyan = vec3(0.0, 1.0, 1.0); // Pure cyan highlight
          
          float t = sin(vPos.x*2. + uTime*2.) * 0.5 + 0.5;
          vec3 color = mix(darkCyan, brightCyan, t);
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });

    this.orbCore = new THREE.Mesh(geometry, coreMat);
    this.orbCore.scale.set(0.7, 0.7, 0.7);
    this.scene.add(this.orbCore);

    // 2. Glow Layer Material (Vibrant electric cyan glow)
    const glowMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uScale: { value: 1 }, uIntensity: { value: 1.2 } },
      vertexShader,
      fragmentShader: `
        uniform float uTime, uIntensity;
        varying vec3 vPos;
        void main() {
          float rim = pow(1.0 - abs(dot(normalize(vPos), vec3(0,0,1))), 2.5);
          
          // GLOW BASED ON #00FFFF
          vec3 glowBase = vec3(0.0, 0.8, 1.0); 
          
          vec3 glow = glowBase * rim * uIntensity;
          gl_FragColor = vec4(glow, rim * 0.7);
        }
      `,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    
    this.orbGlow = new THREE.Mesh(geometry, glowMat);
    this.orbGlow.scale.set(0.7 * 1.1, 0.7 * 1.1, 0.7 * 1.1);
    this.scene.add(this.orbGlow);

    window.addEventListener('resize', () => this.onResize());
  }

  private onResize(): void {
    const width = this.rendererContainer.nativeElement.clientWidth;
    const height = this.rendererContainer.nativeElement.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate(): void {
    // Run outside Angular to avoid constant change detection cycles
    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        this.animationId = requestAnimationFrame(loop);
        const t = this.clock.getElapsedTime();

        const activity = (Math.sin(t * 8) * 0.15 + 0.85) + (Math.sin(t * 16) * 0.05);

        // Update Uniforms
        const coreUniforms = (this.orbCore.material as THREE.ShaderMaterial).uniforms;
        const glowUniforms = (this.orbGlow.material as THREE.ShaderMaterial).uniforms;

        coreUniforms['uTime'].value = glowUniforms['uTime'].value = t * 1.5;
        coreUniforms['uScale'].value = glowUniforms['uScale'].value = activity;
        glowUniforms['uIntensity'].value = activity * 1.2;

        this.orbCore.rotation.y = this.orbGlow.rotation.y = t * 0.2;
        this.orbCore.rotation.z = this.orbGlow.rotation.z = t * 0.1;

        this.renderer.render(this.scene, this.camera);
      };
      loop();
    });
  }
}
import { Component, OnInit, HostListener, ElementRef, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomainsService } from '../../@shared/services/domains.service';
import { Domain } from '../../../@models/domain.model';

interface DisplayDomain extends Domain {
  displayIcon: string;
  summary: string;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})

export class LandingPageComponent implements OnInit, AfterViewInit {
  isScrolled = false;
  activeSection = 'overview';
  domains$!: Observable<DisplayDomain[]>;

  activeStep = 1;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Existing logic for isScrolled and activeSection...
    this.isScrolled = window.scrollY > 40;
    const sections = ['overview', 'features', 'solutions', 'integrations', 'workflow', 'faqs'];
    for (const s of sections) {
      const el = document.getElementById(s);
      if (el && el.getBoundingClientRect().top <= 200) this.activeSection = s;
    }

    // New Workflow Scroll Logic
    const workflowSection = document.getElementById('workflow-container');
    if (workflowSection) {
      const rect = workflowSection.getBoundingClientRect();
      const sectionHeight = rect.height;
      const scrollPosition = -rect.top; // How far we've scrolled into the section
      
      // Divide the section height by the 4 steps
      const stepRatio = sectionHeight / 4;
      
      if (scrollPosition < stepRatio) this.activeStep = 1;
      else if (scrollPosition < stepRatio * 2) this.activeStep = 2;
      else if (scrollPosition < stepRatio * 3) this.activeStep = 3;
      else this.activeStep = 4;
    }
  }

  showChangelogModal = false;

  navItems = [
    { id: 'mission', label: 'Mission' },
    { id: 'analytics', label: 'Performance' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'governance', label: 'Governance' },
    { id: 'inventory', label: 'Marketplace' },
    { id: 'integrations', label: 'Ecosystem' },
    { id: 'faqs', label: 'FAQs' }
  ];

  handleNavClick(item: any, event: Event) {
    if (item.id === 'version') {
      event.preventDefault(); // Stop page jump
      this.showChangelogModal = true;
    }
  }

  closeModal() {
    this.showChangelogModal = false;
  }

  stats = [
    { current: 0, target: 500, suffix: '+', label: 'Assets', decimals: 0 },
    { current: 0, target: 25, suffix: '+', label: 'Countries', decimals: 0 },
    { current: 0, target: 15, suffix: 'K+', label: 'Lifetime Request', decimals: 0 },
    { current: 0, target: 0.4, suffix: 's', label: 'API Latency', decimals: 1 }
  ];

  hasAnimated = false;

  sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'faqs', label: 'FAQs' }
  ];

  faqs = [
    { 
      q: 'How is data security handled?', 
      a: 'GDX utilizes Zero-Trust architecture integrated with Azure AD and automated PII masking.', 
      open: false 
    },
    { 
      q: 'How do I request access to a product?', 
      a: "It's as intuitive as shopping on Amazon marketplace. Once you add products to your cart or begin the Data Access Request (DAR), our SuggestedAI Engine analyzes your 'Statement of Intent' in real-time. By mapping your text to our alogrithm, the SuggestedAI identifies and recommends complementary products that align with your project goals, effectively consolidating multiple requests into a single, unified workflow.",
      open: false 
    },
    { 
      q: 'Can I add my own products to Global Data Xchange Platforn?', 
      a: 'Yes, just use our Product Intake form to submit a request to add a product to the platform.', 
      open: false 
    },
    {
      q: 'What is GDXP and how is it different from a standard catalog?',
      a: "GDXP is a smarter and intelligent actionable marketplace, not just a platform. It integrates directly with ServiceNow to automate permissions, meaning you don't just find data—you receive it.",
      open: false
    },
    {
      q: 'How does "Velocity Delivery" work for data access?',
      a: 'Public and Protected datasets are bypass-enabled. If you order these, the system triggers automated provisioning, granting you access within 24 hours.',
      open: false
    },
    {
      q: 'What is the "One Toyota Service" integration?',
      a: 'Every request you make in GDXP automatically generates a ServiceNow ticket. This ensures compliance, automated audit trails, and real-time tracking of your request.',
      open: false
    },
    {
      q: 'Can I request data for myselfand my entire team at once?',
      a: 'Yes. Our "Multiple Checkout" feature allows you to bundle products and specify if access is for an yourself or an individual.',
      open: false
    },
    {
      q: "How does AI Suggested Products know what I need when i'm feeling out the Data Access Request form?",
      a: "The SuggestedAI Engine is running a live comparison between your intent and the DNA of the product catalog as well as thousands of previous successful data requests to see which products were ultimately provisioned for similar descriptions. It essentially learns from the community's past behavior to predict your current wants, ensuring that even if you don't know the exact product name, the AI can find the 'Data Node' that fits your request.",
      open: false
    }
  ];

  features = [
    { title: 'Semantic Indexing', icon: 'bx bx-brain', desc: 'Vector-based discovery powered by the SuggestedAI module.' },
    { title: 'Asset Marketplace', icon: 'mdi mdi-store-outline', desc: 'Unified view of Catalogs, Resources, and Organizations.' },
    { title: 'Intake Protocol', icon: 'fa-solid fa-shield-halved', desc: 'Secure ingestion with automated PII & SPI classification.' },
    { title: 'Provisioning Engine', icon: 'dripicons-to-do', desc: 'Task-based workflow for dataset access and ordering.' }
  ];

  constructor(
    private domainsService: DomainsService, 
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.domains$ = this.domainsService.getDomains().pipe(
      map(domains => domains.slice(0, 5).map(d => ({
        ...d,
        displayIcon: this.getIcon(d.name),
        summary: `Unified enterprise assets for the ${d.name} domain.`
      } as DisplayDomain)))
    );
  }

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !this.hasAnimated) {
        this.animateNumbers();
        this.hasAnimated = true;
      }
    }, { threshold: 0.5 });

    const target = this.el.nativeElement.querySelector('#analytics');
    if (target) observer.observe(target);
  }

  animateNumbers() {
    const duration = 2000; // 2 seconds for high-impact arrival
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);

    this.stats.forEach(stat => {
      let frame = 0;
      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        // Using easeOutExpo for that "braking" effect at the end
        const easeProgress = 1 - Math.pow(2, -10 * progress);
        
        stat.current = +(easeProgress * stat.target).toFixed(stat.decimals);

        if (frame === totalFrames) {
          stat.current = stat.target;
          clearInterval(counter);
        }
      }, frameRate);
    });
  }

  private getIcon(name: string): string {
    const icons: any = { 'Sales': 'mdi-chart-line', 'Finance': 'mdi-wallet', 'Manufacturing': 'mdi-factory' };
    return icons[name] || 'mdi-database-outline';
  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
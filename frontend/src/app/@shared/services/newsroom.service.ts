import { Injectable } from '@angular/core';
import { Newsroom } from '../interfaces/newsroom';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NewsroomService {
  private createSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-').trim();
  }

  private selectedCategorySubject = new BehaviorSubject<string | null>(null);
  selectedCategory$ = this.selectedCategorySubject.asObservable();

  setSelectedCategory(cat: string | null) {
    this.selectedCategorySubject.next(cat);
  }

  private rawNewsroom: Omit<Newsroom, 'slug'>[] = [
    {
      id: '1',
      title: 'Angular Standalone Components Deep Dive',
      summary: 'Explore how standalone components simplify Angular architecture.',
      content: '<p>Standalone components remove the dependency on NgModules and simplify wiring of dependencies.</p>',
      image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200',
      author: 'John Doe',
      authorImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      date: 'May 2026',
      category: 'features'
    },
    {
      id: '2',
      title: 'Enterprise Angular Scaling Techniques',
      summary: 'Best approaches to scale large Angular apps efficiently.',
      content: '<p>Use lazy loading, clear boundaries and strong typing to scale.</p>',
      image: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1200',
      author: 'Jane Smith',
      authorImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      date: 'May 2026',
      category: 'features'
    },
    {
      id: '3',
      title: 'Angular CLI Updates',
      summary: 'CLI improvements for faster builds.',
      content: '<p>Angular CLI  improves build speed and DX.</p>',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
      author: 'Emma Walker',
      authorImage: 'https://randomuser.me/api/portraits/women/10.jpg',
      date: 'April 2026',
      category: 'updates'
    },
    {
      id: '4',
      title: 'Web Performance API Updates',
      summary: 'Track performance with new browser APIs.',
      content: '<p>New APIs help measure real user metrics more accurately.</p>',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
      author: 'James King',
      authorImage: 'https://randomuser.me/api/portraits/men/13.jpg',
      date: 'March 2026',
      category: 'updates'
    },
    {
      id: '5',
      title: 'AI in Web Development',
      summary: 'AI is transforming developer workflows.',
      content: '<p>AI tools assist with coding, testing and optimization.</p>',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200',
      author: 'Lucas Green',
      authorImage: 'https://randomuser.me/api/portraits/men/15.jpg',
      date: 'May 2026',
      category: 'trending'
    },
    {
      id: '6',
      title: 'Jamstack Popularity',
      summary: 'Jamstack improves performance via CDN delivery.',
      content: '<p>Static-first approaches remain popular for fast sites.</p>',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200',
      author: 'Chloe Evans',
      authorImage: 'https://randomuser.me/api/portraits/women/18.jpg',
      date: 'April 2026',
      category: 'trending'
    },
    {
      id: '7',
      title: 'Angular Security Best Practices',
      summary: 'Secure your Angular applications.',
      content: '<p>Sanitize inputs, use HttpInterceptors for auth and follow OWASP guidance.</p>',
      image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1200',
      author: 'Isabella Parker',
      authorImage: 'https://randomuser.me/api/portraits/women/22.jpg',
      date: 'May 2026',
      category: 'security'
    },
    {
      id: '8',
      title: 'JWT Authentication Guide',
      summary: 'Implement token based auth correctly.',
      content: '<p>Store tokens safely and validate on the server.</p>',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200',
      author: 'Charlotte Stewart',
      authorImage: 'https://randomuser.me/api/portraits/women/24.jpg',
      date: 'May 2026',
      category: 'security'
    },
    {
      id: '9',
      title: 'New macOS Update',
      summary: 'Implementing new macODS update tonight',
      content: '<p>Run the lasest macOS 26 on you mac.</p>',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200',
      author: 'Jane Doe',
      authorImage: 'https://randomuser.me/api/portraits/women/24.jpg',
      date: 'Novermber 2026',
      category: 'update'
    }
  ];

  private newsroom: Newsroom[] = this.rawNewsroom.map(item => ({
    ...item,
    slug: this.createSlug(item.title)
  }));

  getNewsroom(): Newsroom[] {
    return [...this.newsroom];
  }

  getNewsroomById(id: string): Newsroom | undefined {
    return this.newsroom.find(x => x.id === id);
  }

  getNewsroomBySlug(slug: string): Newsroom | undefined {
    return this.newsroom.find(x => x.slug === slug);
  }

  getByCategory(category: string): Newsroom[] {
    return this.newsroom.filter(x => x.category === category);
  }

  search(query: string): Newsroom[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getNewsroom();
    return this.newsroom.filter(x =>
      x.title.toLowerCase().includes(q) ||
      x.summary.toLowerCase().includes(q) ||
      (x.content && x.content.toLowerCase().includes(q))
    );
  }
}
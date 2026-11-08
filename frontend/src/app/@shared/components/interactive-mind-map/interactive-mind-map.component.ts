import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

export type MindKind = 'pillar' | 'domain' | 'topic' | 'group';

export interface MindNode {
  label: string;
  kind: MindKind;
  note?: string;
  children?: MindNode[];
}

interface MindMapFile {
  title?: string;
  left?: MindNode[];
  right?: MindNode[];
}

@Component({
  selector: 'app-interactive-mind-map',
  templateUrl: './interactive-mind-map.component.html',
  styleUrls: ['./interactive-mind-map.component.scss']
})
export class InteractiveMindMapComponent implements OnInit {
  readonly source = 'assets/docs/protected/Mind_Map.json';
  title = 'Security Domains';
  left: MindNode[] = [];
  right: MindNode[] = [];
  query = '';
  selected: MindNode | null = null;
  loading = true;
  loadError = '';
  private readonly open = new Set<string>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = '';
    this.http.get<MindMapFile>(this.source, {
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      params: { t: Date.now().toString() }
    }).subscribe({
      next: file => {
        this.title = file?.title || 'Security Domains';
        this.left = Array.isArray(file?.left) ? file.left : [];
        this.right = Array.isArray(file?.right) ? file.right : [];
        this.selected = null;
        this.collapseToPillars();
        this.loading = false;
      },
      error: () => {
        this.left = [];
        this.right = [];
        this.loading = false;
        this.loadError = 'The mind map file could not be read.';
      }
    });
  }

  toggle(node: MindNode, path: string): void {
    this.selected = node;
    if (!node.children?.length) {
      return;
    }
    if (this.open.has(path)) {
      this.open.delete(path);
    } else {
      this.open.add(path);
    }
  }

  isOpen(node: MindNode, path: string): boolean {
    return this.open.has(path) || (this.query.trim().length > 0 && this.matches(node));
  }

  visible(node: MindNode): boolean {
    const term = this.query.trim().toLowerCase();
    if (!term) {
      return true;
    }
    return this.matches(node);
  }

  expandAll(): void {
    this.walk([...this.left, ...this.right], '', (node, path) => {
      if (node.children?.length) {
        this.open.add(path);
      }
    });
  }

  collapseToPillars(): void {
    this.open.clear();
    [...this.left, ...this.right].forEach(node => this.open.add(node.label));
  }

  groupCount(node: MindNode): number {
    if (node.kind === 'group') {
      return 1;
    }
    return (node.children || []).reduce((sum, child) => sum + this.groupCount(child), 0);
  }

  private matches(node: MindNode): boolean {
    const term = this.query.trim().toLowerCase();
    if (node.label.toLowerCase().includes(term) || (node.note || '').toLowerCase().includes(term)) {
      return true;
    }
    return (node.children || []).some(child => this.matches(child));
  }

  private walk(nodes: MindNode[], parent: string, visit: (node: MindNode, path: string) => void): void {
    nodes.forEach(node => {
      const path = parent ? parent + '/' + node.label : node.label;
      visit(node, path);
      if (node.children) {
        this.walk(node.children, path, visit);
      }
    });
  }
}

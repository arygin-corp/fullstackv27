import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { KbArticle } from './support-knowledge';
import { categoryLabel, presentArticleById, relatedArticles } from './support-media';

@Component({
  selector: 'app-support-article',
  templateUrl: './support-article.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportArticleComponent implements OnDestroy {
  article: KbArticle | null = null;
  related: KbArticle[] = [];
  categoryName = '';
  private subscription: Subscription;

  constructor(private route: ActivatedRoute) {
    this.subscription = this.route.paramMap.subscribe(params => {
      const id = params.get('articleId') || '';
      const article = presentArticleById(id);
      this.article = article || null;
      this.related = article ? relatedArticles(article) : [];
      this.categoryName = article ? categoryLabel(article.category) : '';
      window.scrollTo(0, 0);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  trackArticle(_index: number, article: KbArticle): string {
    return article.id;
  }
}

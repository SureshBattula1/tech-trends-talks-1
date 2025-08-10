import { Component, Input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { Blog } from '../../../services/api.service';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [SharedModule, RouterModule, NgOptimizedImage],
  templateUrl: './blog-card.component.html',
  styleUrl: './blog-card.component.scss'
})
export class BlogCardComponent {
  // Signals
  readonly blog = signal<Blog | null>(null);
  readonly featured = signal(false);

  // Inputs
  @Input()
  set blogInput(value: Blog | null) {
    this.blog.set(value);
  }

  @Input()
  set featuredInput(value: boolean) {
    this.featured.set(value);
  }

  // Helper functions
  getImageUrl(image: string): string {
    if (!image) {
      return 'https://picsum.photos/400/250?random=' + Math.floor(Math.random() * 1000);
    }
    if (image.startsWith('http')) {
      return image;
    }
    if (image.startsWith('/storage')) {
      return `http://localhost:8000${image}`;
    }
    return `http://localhost:8000/storage/images/blog/${image}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTruncatedExcerpt(excerpt: string, maxLength: number = 150): string {
    if (!excerpt) return '';
    return excerpt.length > maxLength
      ? excerpt.substring(0, maxLength) + '...'
      : excerpt;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://picsum.photos/400/250?random=' + Math.floor(Math.random() * 1000);
  }
}

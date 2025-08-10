import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgOptimizedImage, NgFor } from '@angular/common';
import { ApiService, Blog } from '../../../services/api.service';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [NgIf, NgOptimizedImage, NgFor, MatChipsModule],
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss']
})
export class BlogDetailsComponent implements OnInit {
  blog = signal<Blog | null>(null);
  isLoading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadBlog(id);
    } else {
      this.isLoading.set(false);
    }
  }

  private loadBlog(id: number) {
    this.apiService.getBlog(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.blog.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getImageUrl(image?: string): string {
    if (!image) {
      return `https://picsum.photos/800/400?random=${Math.floor(Math.random() * 1000)}`;
    }
    if (image.startsWith('http')) return image;
    if (image.startsWith('/storage')) return `http://localhost:8000${image}`;
    return `http://localhost:8000/storage/images/blog/${image}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = `https://picsum.photos/800/400?random=${Math.floor(Math.random() * 1000)}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

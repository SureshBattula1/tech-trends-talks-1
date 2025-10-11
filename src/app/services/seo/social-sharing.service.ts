import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

export interface SocialShareConfig {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialSharingService {
  private meta = inject(Meta);

  /**
   * Update social media meta tags for sharing
   */
  updateSocialTags(config: SocialShareConfig): void {
    // Open Graph tags for Facebook, LinkedIn, etc.
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:image', content: config.image });
    this.meta.updateTag({ property: 'og:url', content: config.url });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Tech Trends Talks' });
    this.meta.updateTag({ property: 'og:locale', content: 'en_IN' });
    
    // Image dimensions for better display
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:alt', content: config.title });
    this.meta.updateTag({ property: 'og:image:type', content: 'image/png' });

    // Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:site', content: '@TechTrendsTalks' });
    this.meta.updateTag({ name: 'twitter:creator', content: '@TechTrendsTalks' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: config.image });
    this.meta.updateTag({ name: 'twitter:image:alt', content: config.title });
    
    // Twitter App Card (if you have a mobile app)
    this.meta.updateTag({ name: 'twitter:app:name:iphone', content: 'Tech Trends Talks' });
    this.meta.updateTag({ name: 'twitter:app:name:ipad', content: 'Tech Trends Talks' });
    this.meta.updateTag({ name: 'twitter:app:name:googleplay', content: 'Tech Trends Talks' });

    // LinkedIn specific tags
    this.meta.updateTag({ property: 'og:see_also', content: 'https://linkedin.com/company/techtrendstalks' });

    // Pinterest specific
    this.meta.updateTag({ name: 'pinterest:description', content: config.description });

    // WhatsApp and Telegram optimization
    this.meta.updateTag({ property: 'og:image:secure_url', content: config.image.replace('http://', 'https://') });
  }

  /**
   * Generate social sharing URLs
   */
  getSharingUrls(config: SocialShareConfig): Record<string, string> {
    const encodedUrl = encodeURIComponent(config.url);
    const encodedTitle = encodeURIComponent(config.title);
    const encodedDescription = encodeURIComponent(config.description);

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=TechTrendsTalks`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
    };
  }

  /**
   * Open sharing dialog
   */
  share(platform: string, config: SocialShareConfig): void {
    const urls = this.getSharingUrls(config);
    const url = urls[platform];

    if (url) {
      if (platform === 'email') {
        window.location.href = url;
      } else {
        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(
          url,
          'share-dialog',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
        );
      }
    }
  }

  /**
   * Check if Web Share API is supported
   */
  canUseWebShare(): boolean {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  }

  /**
   * Use native Web Share API if available
   */
  async shareNative(config: SocialShareConfig): Promise<void> {
    if (this.canUseWebShare()) {
      try {
        await (navigator as any).share({
          title: config.title,
          text: config.description,
          url: config.url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  }

  /**
   * Copy link to clipboard
   */
  async copyToClipboard(url: string): Promise<boolean> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        return true;
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  }
}


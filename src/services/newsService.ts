/**
 * newsService.ts — News data service layer.
 */
import { getNews } from '../api/endpoints';
import type { NewsItem, NewsResponse } from '../types/api';

export { getNews };
export type { NewsItem, NewsResponse };

/**
 * Map sentiment to display color class
 */
export function sentimentColor(sentiment?: string): string {
  switch (sentiment) {
    case 'positive': return 'text-primary';
    case 'negative': return 'text-error';
    default: return 'text-on-surface-variant';
  }
}

/**
 * Map sentiment to badge background
 */
export function sentimentBadge(sentiment?: string): string {
  switch (sentiment) {
    case 'positive': return 'bg-primary';
    case 'negative': return 'bg-error';
    default: return 'bg-[#534AB7]';
  }
}

/**
 * Format published timestamp to relative time (e.g. "2h ago", "Yesterday")
 */
export function formatNewsTime(publishedAt?: string): string {
  if (!publishedAt) return '';

  const now = Date.now();
  const published = new Date(publishedAt).getTime();
  const diffMs = now - published;

  if (isNaN(diffMs) || diffMs < 0) return '';

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

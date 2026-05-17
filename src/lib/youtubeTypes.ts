/** Subset of YouTube Data API v3 search.list response */

export interface YouTubeSearchSnippet {
  title: string;
  description?: string;
  channelTitle?: string;
}

export interface YouTubeSearchItem {
  id: { kind: string; videoId?: string };
  snippet: YouTubeSearchSnippet;
}

export interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
  error?: { message: string; code: number };
}

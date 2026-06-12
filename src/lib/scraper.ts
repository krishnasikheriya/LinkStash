import * as cheerio from 'cheerio';

export interface ScrapedData {
  title: string | null;
  description: string | null;
  ogImage: string | null;
}

export async function scrapeUrl(url: string): Promise<ScrapedData> {
  try {
    // Using a generic, modern User-Agent to bypass basic bot protection
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      throw new Error(`Fetch failed with status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extracting metadata using Cheerio selectors
    const title = $('title').text() || null;
    const description = $('meta[name="description"]').attr('content') || null;
    const ogImage = $('meta[property="og:image"]').attr('content') || null;

    return {
      title,
      description,
      ogImage
    };
  } catch (error) {
    console.error(`Failed to scrape URL (${url}):`, error);
    // Graceful degradation: return nulls so the bookmark can still be saved
    return {
      title: null,
      description: null,
      ogImage: null
    };
  }
}
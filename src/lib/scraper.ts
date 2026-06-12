import * as cheerio from 'cheerio';

export interface ScrapedData {
  title: string | null;
  description: string | null;
  ogImage: string | null;
}

export async function scrapeUrl(url: string): Promise<ScrapedData> {
  try {

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

    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || null;
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || null;

    let ogImageRaw = $('meta[property="og:image"]').attr('content') || 
                     $('meta[name="twitter:image"]').attr('content') ||
                     $('meta[itemprop="image"]').attr('content') ||
                     $('link[rel="apple-touch-icon"]').attr('href') ||
                     null;

    let ogImage = null;
    if (ogImageRaw) {
      try {

        ogImage = new URL(ogImageRaw, url).href;
      } catch (e) {
        ogImage = ogImageRaw;
      }
    } else {

      try {
        const urlObj = new URL(url);
        ogImage = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${urlObj.origin}&size=256`;
      } catch (e) {

      }
    }

    return {
      title,
      description,
      ogImage
    };
  } catch (error) {
    console.error(`Failed to scrape URL (${url}):`, error);

    return {
      title: null,
      description: null,
      ogImage: null
    };
  }
}
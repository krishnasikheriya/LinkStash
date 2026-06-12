import * as cheerio from 'cheerio';

export interface ScrapedData {
  title: string | null;
  description: string | null;
  ogImage: string | null;
}

export async function scrapeUrl(url: string): Promise<ScrapedData> {
  // TODO: Implement the scraper logic
  // 1. Use the native `fetch` API to get the HTML content of the URL
  // 2. Load the HTML string into cheerio: const $ = cheerio.load(html);
  // 3. Extract the <title> text
  // 4. Extract the <meta name="description"> content
  // 5. Extract the <meta property="og:image"> content
  // 6. Return the extracted data
  
  // Hint: Many websites block bots. Try setting a legitimate-looking `User-Agent` header in your fetch request!
  
  return {
    title: null,
    description: null,
    ogImage: null,
  };
}
